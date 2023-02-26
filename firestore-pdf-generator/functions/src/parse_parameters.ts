import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer";
import { extensionParameters } from "lib/utilities/extension_parameters";
import { ParsedParameters } from "lib/utilities/parameters";

export interface FirestoreParameters {
  data: FirebaseFirestore.DocumentData;
  id: string;
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
}: {
  rawParameters: FirestoreParameters;
}): ParsedParameters {
  if (typeof rawParameters.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (rawParameters.data instanceof Array) {
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

  const templatePath = extensionParameters.TEMPLATE_PATH;

  const parts = templatePath.split("/");
  const templateBucket = parts[0];
  const templatePrefix =
    parts.length > 2 ? parts.slice(1, -1).join("/") + "/" : "";
  const templateId = parts[parts.length - 1];

  const parameters = {
    adjustHeightToFit:
      extensionParameters.ADJUST_HEIGHT_TO_FIT.toLowerCase() === "yes",
    chromiumPdfOptions: Object.fromEntries(
      Object.entries((parsedChromiumPdfOptions as PDFOptions) ?? {}).map(
        ([key, value]) => {
          if (BOOLEAN_PDF_OPTIONS.includes(key)) {
            return [key, value.toLowerCase() === "true"];
          }
          return [key, value];
        }
      )
    ),
    data: rawParameters.data ?? {},
    headless: process.env.IS_LOCAL != "true",
    outputFileName:
      rawParameters.id != null
        ? `${rawParameters.id}.pdf`
        : `${uuidv4()}-${new Date().toISOString()}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    networkIdleTime: Number.parseInt(extensionParameters.NETWORK_IDLE_TIME),
    shouldWaitForIsReady:
      extensionParameters.SHOULD_WAIT_FOR_IS_READY.toLowerCase() === "yes",
  };

  return parameters;
}
