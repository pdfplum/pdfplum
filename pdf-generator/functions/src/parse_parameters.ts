import { uuidv4 } from "@firebase/util";
import { PDFOptions } from "puppeteer-core";
import { ParsedQs } from "qs";

export interface GetParameters {
  adjustHeightToFit?: "true" | "false";
  chromiumPdfOptions?: PDFOptions;
  data?: ParsedQs;
  headful?: "true" | "false";
  outputFileName?: string;
  templateId?: string;
}

export interface ParsedParameters {
  adjustHeightToFit: boolean;
  chromiumPdfOptions: PDFOptions;
  data: ParsedQs;
  headful: boolean;
  outputFileName: string;
  templateId: string;
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
  defaultTemplateId,
}: {
  query: GetParameters;
  defaultTemplateId: string;
}): ParsedParameters {
  if (typeof query.data === "string") {
    throw new Error("'data' should be an object, not a string.");
  }

  if (query.data instanceof Array) {
    throw new Error("'data' should be an object, not an array.");
  }

  if (query.templateId != null && typeof query.templateId !== "string") {
    throw new Error("'templateId' should be a string.");
  }

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
    templateId: query.templateId ?? defaultTemplateId,
  };
}
