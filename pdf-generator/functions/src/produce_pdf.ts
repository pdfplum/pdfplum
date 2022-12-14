import { loadTemplate } from "./load_template";
import { ParsedParameters } from "./parse_parameters";
import { renderPdf } from "./render_pdf";
import { serveTemplate } from "./serve_template";
import { storePdf } from "./store_pdf";
import { runAction } from "./utilities/action";
import { eventChannel } from "./utilities/event_channel";
import {
  extensionParameters,
  ExtensionParameters,
} from "./utilities/extension_parameters";

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
