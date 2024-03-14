import { loadTemplate } from "./load_template";
import { ParsedParameters } from "./utilities/parameters";
import { renderPdf } from "./render_pdf";
import { serveTemplate } from "./serve_template";
import { storePdf } from "./store_pdf";
import { runAction } from "./utilities/action";
import { eventChannel, EVENT_TYPE_PREFIX } from "src/event_channel";
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
 * Returns the generated PDF and its metadata.
 */
export async function producePdf({
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

  const { publicUrl, location } = await runAction(storePdf, {
    ...parameters,
    pdf,
  });

  const pdfInformation = {
    timestamp: new Date().getTime(),
    publicUrl,
    location,
    fileSize: pdf.length,
  };

  const functionContext = {
    ...pdfInformation,
    parameters,
    extensionParameters,
  };

  if (eventChannel) {
    await eventChannel.publish({
      type: `${EVENT_TYPE_PREFIX}complete`,
      subject: parameters.templateId,
      data: functionContext,
    });
  }

  return { functionContext, pdf };
}
