import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer";
import { ParsedQs } from "qs";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters } from "lib/utilities/parameters";

export interface GetParameters {
  adjustHeightToFit?: "yes" | "no";
  chromiumPdfOptions?: PDFOptions;
  data?: ParsedQs;
  headful?: "true" | "false";
  outputStorageBucket?: string;
  outputStoragePrefix?: string;
  outputFileName?: string;
  templatePath?: string;
  networkIdleTime?: string;
  shouldWaitForIsReady?: "yes" | "no";
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
  getParameters,
}: {
  getParameters: GetParameters;
}): ParsedParameters {
  if (typeof getParameters.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (getParameters.data instanceof Array) {
    throw new Error("'data' should be an object, not an array.");
  }

  let parsedChromiumPdfOptions = {};

  try {
    parsedChromiumPdfOptions = JSON.parse(
      extensionParameters.CHROMIUM_PDF_OPTIONS ?? "{}"
    );
  } catch (exception) {
    throw new Error("'CHROMIUM_PDF_OPTIONS' is not a valid JSON document.");
  }

  if (
    getParameters.templatePath != null &&
    typeof getParameters.templatePath !== "string"
  ) {
    throw new Error("'templatePath' should be a string.");
  }

  const templatePath =
    getParameters.templatePath ?? extensionParameters.TEMPLATE_PATH;

  const parts = templatePath.split("/");
  const templateBucket = parts[0];
  const templatePrefix =
    parts.length > 2 ? parts.slice(1, -1).join("/") + "/" : "";
  const templateId = parts[parts.length - 1];

  const parameters = {
    adjustHeightToFit:
      (getParameters.adjustHeightToFit?.toLowerCase() ??
        extensionParameters.ADJUST_HEIGHT_TO_FIT?.toLowerCase()) === "yes",
    // Convert strings representing boolean values to booleans
    chromiumPdfOptions: Object.fromEntries(
      Object.entries(
        ({
          ...parsedChromiumPdfOptions,
          ...getParameters.chromiumPdfOptions,
        } as PDFOptions) ?? {}
      ).map(([key, value]) => {
        if (BOOLEAN_PDF_OPTIONS.includes(key)) {
          return [key, value.toLowerCase() === "true"];
        }
        return [key, value];
      })
    ),
    data: getParameters.data ?? {},
    headless:
      process.env.IS_LOCAL == "true"
        ? !(getParameters.headful?.toLowerCase() === "true")
        : true,
    outputStorageBucket:
      getParameters.outputStorageBucket ??
      extensionParameters.OUTPUT_STORAGE_BUCKET,
    outputStoragePrefix:
      getParameters.outputStoragePrefix ??
      extensionParameters.OUTPUT_STORAGE_PREFIX,
    outputFileName:
      getParameters.outputFileName ??
      `${uuidv4()}-${new Date().toISOString()}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    networkIdleTime: Number.parseInt(
      getParameters.networkIdleTime ??
        (extensionParameters.NETWORK_IDLE_TIME || "0")
    ),
    shouldWaitForIsReady:
      (getParameters.shouldWaitForIsReady?.toLowerCase() ??
        extensionParameters.SHOULD_WAIT_FOR_IS_READY.toLowerCase()) === "yes",
  };

  return parameters;
}
