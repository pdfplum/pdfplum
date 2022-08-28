import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer";
import { ParsedQs } from "qs";

export interface GetParameters {
  adjustHeightToFit?: "true" | "false";
  chromiumPdfOptions?: PDFOptions;
  data?: ParsedQs;
  headful?: "true" | "false";
  outputFileName?: string;
  templatePath?: string;
  shouldWaitForIsReady?: "true" | "false";
}

export interface ParsedParameters {
  adjustHeightToFit: boolean;
  chromiumPdfOptions: PDFOptions;
  data: ParsedQs;
  headful: boolean;
  outputFileName: string;
  templateBucket: string;
  templatePrefix: string;
  templateId: string;
  shouldWaitForIsReady: boolean;
}

const BOOLEAN_PDF_OPTIONS = [
  "printBackground",
  "displayHeaderFooter",
  "landscape",
  "preferCSSPageSize",
  "omitBackground",
];

/**
 * Parse get parameters, converts their data structure when needed and reported errors if any.
 *
 * @return {ParsedParameters}
 */
export function parseParameters({
  query,
  defaultTemplatePath,
}: {
  query: GetParameters;
  defaultTemplatePath: string;
}): ParsedParameters {
  if (typeof query.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (query.data instanceof Array) {
    throw new Error("'data' should be an object, not an array.");
  }

  if (query.templatePath != null && typeof query.templatePath !== "string") {
    throw new Error("'templatePath' should be a string.");
  }

  const templatePath = query.templatePath ?? defaultTemplatePath;
  const parts = templatePath.split("/");
  const templateBucket = parts[0];
  const templatePrefix = parts.slice(1, -2).join("/");
  const templateId = parts[parts.length - 1];

  return {
    adjustHeightToFit: query.adjustHeightToFit?.toLowerCase() === "true",
    chromiumPdfOptions: Object.fromEntries(
      Object.entries((query.chromiumPdfOptions as PDFOptions) ?? {}).map(
        ([key, value]) => {
          if (BOOLEAN_PDF_OPTIONS.includes(key)) {
            return [key, value.toLowerCase() === "true"];
          }
          return [key, value];
        }
      )
    ),
    data: query.data ?? {},
    headful: query.headful?.toLowerCase() === "true",
    outputFileName:
      query.outputFileName ?? `${uuidv4()}-${new Date().toISOString()}.pdf`,
    templateBucket,
    templatePrefix,
    templateId,
    shouldWaitForIsReady: query.shouldWaitForIsReady?.toLowerCase() === "true",
  };
}
