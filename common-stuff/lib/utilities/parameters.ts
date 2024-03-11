import { PDFOptions } from "puppeteer";

export type TemplateParameters = {
  [key: string]:
    | undefined
    | string
    | number
    | boolean
    | TemplateParameters
    | TemplateParameters[];
};

export interface ParsedParameters {
  adjustHeightToFit: boolean;
  chromiumPdfOptions: PDFOptions;
  data: TemplateParameters;
  headless: boolean;
  outputStorageBucket: string | undefined;
  outputStoragePrefix: string | undefined;
  outputFileName: string;
  returnPdfInResponse: boolean;
  templateBucket: string;
  templatePrefix: string;
  templateId: string;
  networkIdleTime: number;
  shouldWaitForIsReady: boolean;
}
