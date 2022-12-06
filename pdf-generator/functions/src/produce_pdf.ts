import * as functions from "firebase-functions";
import { eventChannel, runAction } from "./index";
import { loadTemplate } from "./load_template";
import {
  ExtensionParameters,
  extensionParameters,
  ParsedParameters,
} from "./parse_parameters";
import { renderPdf } from "./render_pdf";
import { serveTemplate } from "./serve_template";
import { storePdf } from "./store_pdf";

export interface PdfInformation {
  timestamp: number;
  publicUrl?: string;
  fileSize: number;
}

export interface Parameters {
  outputBucketName: string | undefined;
  parameters: ParsedParameters;
}

export interface ReturnValue {
  pdf: Buffer;
  functionContext: PdfInformation & {
    parameters: ParsedParameters;
    extensionParameters: ExtensionParameters;
  };
}

/**
 * Loads template and renders it based on the provided parameters.
 * Returns the generated pdf and its metadata.
 */
export async function producePdf({
  outputBucketName,
  parameters,
}: Parameters): Promise<ReturnValue> {
  functions.logger.info("Producing pdf from template", parameters);

  const templateFilesPath = await runAction(loadTemplate, parameters);

  const portNumber = await runAction(serveTemplate, {
    path: templateFilesPath,
  });

  const pdf = await runAction(renderPdf, {
    ...parameters,
    portNumber,
  });

  const publicUrl = await runAction(storePdf, {
    ...parameters,
    outputBucketName,
    pdf,
  });

  const pdfInformation = {
    timestamp: new Date().getTime(),
    publicUrl,
    fileSize: pdf.length,
  };

  functions.logger.info("Pdf produced successfully");

  const functionContext = {
    ...pdfInformation,
    parameters,
    extensionParameters,
  };

  if (eventChannel) {
    await eventChannel.publish({
      type: "firebase.extensions.pdf-generator.v1.complete",
      subject: parameters.templateId,
      data: functionContext,
    });
  }

  return { functionContext, pdf };
}
