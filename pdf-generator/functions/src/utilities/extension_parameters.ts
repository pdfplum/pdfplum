export type ExtensionParameters = {
  ADJUST_HEIGHT_TO_FIT: "yes" | "no";
  CHROMIUM_PDF_OPTIONS: string;
  OUTPUT_STORAGE_BUCKET?: string;
  RETURN_PDF_IN_RESPONSE: string;
  SHOULD_WAIT_FOR_IS_READY: "yes" | "no";
  TEMPLATE_PATH: string;
};

const {
  ADJUST_HEIGHT_TO_FIT,
  CHROMIUM_PDF_OPTIONS,
  OUTPUT_STORAGE_BUCKET,
  RETURN_PDF_IN_RESPONSE,
  SHOULD_WAIT_FOR_IS_READY,
  TEMPLATE_PATH,
} = process.env as ExtensionParameters;

export const extensionParameters: ExtensionParameters = {
  ADJUST_HEIGHT_TO_FIT,
  CHROMIUM_PDF_OPTIONS,
  OUTPUT_STORAGE_BUCKET,
  RETURN_PDF_IN_RESPONSE,
  SHOULD_WAIT_FOR_IS_READY,
  TEMPLATE_PATH,
};