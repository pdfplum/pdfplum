export type TemplateType = "document" | "sheet" | "slide";

export const GOOGLE_DOCS_EDITORS_MIME_TYPES: {[key in TemplateType]: string} = {
  document: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slide: "application/vnd.google-apps.presentation",
};

export const MICROSFOT_OFFICE_MIME_TYPES: {[key in TemplateType]: string} = {
  document:
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  sheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  slide:
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
