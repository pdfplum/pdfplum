import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer-core";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters, TemplateParameters } from "lib/utilities/parameters";

export interface PostParameters {
  adjustHeightToFit?: boolean;
  chromiumPdfOptions?: PDFOptions;
  data?: TemplateParameters;
  headful?: boolean;
  outputStorageBucket?: string;
  outputStoragePrefix?: string;
  outputFileName?: string;
  returnPdfInResponse: boolean;
  shouldWaitForIsReady?: boolean;
  templatePath?: string;
  networkIdleTime?: string;
}

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
      extensionParameters.CHROMIUM_PDF_OPTIONS ?? "{}",
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
    typeof postParameters,
  );
  const templateId = parts[parts.length - 1];

  const parameters = {
    adjustHeightToFit:
      postParameters.adjustHeightToFit ??
      extensionParameters.ADJUST_HEIGHT_TO_FIT?.toLowerCase() === "yes",
    chromiumPdfOptions: {
      ...parsedChromiumPdfOptions,
      ...postParameters.chromiumPdfOptions,
    },
    data: postParameters.data ?? {},
    headless:
      process.env.IS_LOCAL == "true"
        ? !(postParameters.headful === true)
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
    returnPdfInResponse:
      postParameters.returnPdfInResponse ??
      extensionParameters.RETURN_PDF_IN_RESPONSE.toLowerCase() === "yes",
    templateBucket,
    templatePrefix,
    templateId,
    networkIdleTime: Number.parseInt(
      postParameters.networkIdleTime ??
        (extensionParameters.NETWORK_IDLE_TIME || "0"),
    ),
    shouldWaitForIsReady:
      postParameters.shouldWaitForIsReady ??
      extensionParameters.SHOULD_WAIT_FOR_IS_READY.toLowerCase() === "yes",
  };

  return parameters;
}
