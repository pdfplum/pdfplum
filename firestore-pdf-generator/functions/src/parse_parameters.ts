import { PDFOptions } from "puppeteer";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters } from "lib/utilities/parameters";

export interface FirestoreDocument extends FirebaseFirestore.DocumentData {
  _pdfplum_config?: {
    adjustHeightToFit?: boolean;
    chromiumPdfOptions?: PDFOptions;
    headful?: boolean;
    outputFileName?: string;
    outputStorageBucket?: string;
    templatePath?: string;
    networkIdleTime?: number;
    shouldWaitForIsReady?: boolean;
  };
}

const BOOLEAN_PDF_OPTIONS = [
  "printBackground",
  "displayHeaderFooter",
  "landscape",
  "preferCSSPageSize",
  "omitBackground",
];

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
      extensionParameters.CHROMIUM_PDF_OPTIONS ?? "{}"
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
      ...Object.fromEntries(
        Object.entries((parsedChromiumPdfOptions as PDFOptions) ?? {}).map(
          ([key, value]) => {
            if (BOOLEAN_PDF_OPTIONS.includes(key)) {
              return [key, value.toLowerCase() === "true"];
            }
            return [key, value];
          }
        )
      ),
      ...config?.chromiumPdfOptions,
    },
    data,
    headless:
      process.env.IS_LOCAL == "true" ? !(config?.headful === true) : true,
    outputBucketName:
      config?.outputStorageBucket ?? extensionParameters.OUTPUT_STORAGE_BUCKET,
    outputFileName: config?.outputFileName ?? `${id}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    networkIdleTime:
      config?.networkIdleTime ??
      Number.parseInt(extensionParameters.NETWORK_IDLE_TIME || "0"),
    shouldWaitForIsReady:
      config?.shouldWaitForIsReady ??
      extensionParameters.SHOULD_WAIT_FOR_IS_READY?.toLowerCase() === "yes",
  };

  return parameters;
}
