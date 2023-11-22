import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters, TemplateParameters } from "lib/utilities/parameters";

export interface PostParameters {
  adjustHeightToFit?: "yes" | "no";
  chromiumPdfOptions?: PDFOptions;
  data?: TemplateParameters;
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
  postParameters,
}: {
  postParameters: PostParameters;
}): ParsedParameters {
  if (typeof postParameters.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (postParameters.data instanceof Array) {
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
    postParameters.templatePath != null &&
    typeof postParameters.templatePath !== "string"
  ) {
    throw new Error("'templatePath' should be a string.");
  }

  const templatePath =
    postParameters["templatePath"] ?? extensionParameters.TEMPLATE_PATH;

  const parts = templatePath.split("/");
  const templateBucket = parts[0];
  const templatePrefix =
    parts.length > 2 ? parts.slice(1, -1).join("/") + "/" : "";
  console.log(
    templatePath,
    postParameters,
    postParameters["templatePath"],
    typeof postParameters
  );
  const templateId = parts[parts.length - 1];

  const parameters = {
    adjustHeightToFit:
      (postParameters.adjustHeightToFit?.toLowerCase() ??
        extensionParameters.ADJUST_HEIGHT_TO_FIT?.toLowerCase()) === "yes",
    // Convert strings representing boolean values to booleans
    chromiumPdfOptions: Object.fromEntries(
      Object.entries(
        ({
          ...parsedChromiumPdfOptions,
          ...postParameters.chromiumPdfOptions,
        } as PDFOptions) ?? {}
      ).map(([key, value]) => {
        if (BOOLEAN_PDF_OPTIONS.includes(key)) {
          return [key, value.toLowerCase() === "true"];
        }
        return [key, value];
      })
    ),
    data: postParameters.data ?? {},
    headless:
      process.env.IS_LOCAL == "true"
        ? !(postParameters.headful?.toLowerCase() === "true")
        : true,
    outputStorageBucket:
      postParameters.outputStorageBucket ??
      extensionParameters.OUTPUT_STORAGE_BUCKET,
    outputStoragePrefix:
      postParameters.outputStoragePrefix ??
      extensionParameters.OUTPUT_STORAGE_PREFIX,
    outputFileName:
      postParameters.outputFileName ??
      `${uuidv4()}-${new Date().toISOString()}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    networkIdleTime: Number.parseInt(
      postParameters.networkIdleTime ??
        (extensionParameters.NETWORK_IDLE_TIME || "0")
    ),
    shouldWaitForIsReady:
      (postParameters.shouldWaitForIsReady?.toLowerCase() ??
        extensionParameters.SHOULD_WAIT_FOR_IS_READY.toLowerCase()) === "yes",
  };

  return parameters;
}
