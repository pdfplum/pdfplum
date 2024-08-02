import { PDFOptions } from "puppeteer-core";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters } from "lib/utilities/parameters";

export interface FirestoreDocument extends FirebaseFirestore.DocumentData {
  _pdfplum_config?: {
    adjustHeightToFit?: boolean;
    chromiumPdfOptions?: PDFOptions;
    headful?: boolean;
    outputStorageBucket?: string;
    outputStoragePrefix?: string;
    outputFileName?: string;
    shouldWaitForIsReady?: boolean;
    templatePath?: string;
    networkIdleTime?: number;
  };
}

/**
 * Parses raw parameters and converts their data structure when needed.
 *
 * @return {ParsedParameters}
 */
export function parseParameters({
  rawParameters,
  id,
}: {
  rawParameters: FirestoreDocument;
  id: string;
}): ParsedParameters {
  if (typeof rawParameters.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (rawParameters.data instanceof Array) {
    throw new Error("'data' should be an object, not an array.");
  }

  const { _pdfplum_config: config, ...data } = rawParameters;

  let parsedChromiumPdfOptions = {};

  try {
    parsedChromiumPdfOptions = JSON.parse(
      extensionParameters.CHROMIUM_PDF_OPTIONS ?? "{}",
    );
  } catch (exception) {
    throw new Error("'CHROMIUM_PDF_OPTIONS' is not a valid JSON document.");
  }

  const templatePath =
    config?.templatePath || extensionParameters.TEMPLATE_PATH;

  const parts = templatePath.split("/");
  const templateBucket = parts[0];
  const templatePrefix =
    parts.length > 2 ? parts.slice(1, -1).join("/") + "/" : "";
  const templateId = parts[parts.length - 1];

  const parameters = {
    adjustHeightToFit:
      config?.adjustHeightToFit ??
      extensionParameters.ADJUST_HEIGHT_TO_FIT?.toLowerCase() === "yes",
    chromiumPdfOptions: {
      ...parsedChromiumPdfOptions,
      ...config?.chromiumPdfOptions,
    },
    data,
    headless:
      process.env.IS_LOCAL == "true" ? !(config?.headful === true) : true,
    outputStorageBucket:
      config?.outputStorageBucket ?? extensionParameters.OUTPUT_STORAGE_BUCKET,
    outputStoragePrefix:
      config?.outputStoragePrefix ?? extensionParameters.OUTPUT_STORAGE_PREFIX,
    outputFileName: config?.outputFileName ?? `${id}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    returnPdfInResponse: false,
    networkIdleTime:
      config?.networkIdleTime ??
      Number.parseInt(extensionParameters.NETWORK_IDLE_TIME || "0"),
    shouldWaitForIsReady:
      config?.shouldWaitForIsReady ??
      extensionParameters.SHOULD_WAIT_FOR_IS_READY?.toLowerCase() === "yes",
  };

  return parameters;
}
