const {
  OUTPUT_STORAGE_BUCKET,
  RETURN_PDF_IN_RESPONSE,
  TEMPLATE_ID,
  TEMPLATE_STORAGE_BUCKET,
} = process.env as {
  OUTPUT_STORAGE_BUCKET?: string;
  RETURN_PDF_IN_RESPONSE: string;
  TEMPLATE_ID: string;
  TEMPLATE_STORAGE_BUCKET: string;
};

import * as functions from "firebase-functions";
import { initializeApp } from "firebase/app";
import {
  connectStorageEmulator,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { loadTemplate } from "./load_template";
import { renderPdf } from "./render_pdf";
import { serveTemplate } from "./serve_template";
import { PDFOptions } from "puppeteer-core";
import { ParsedQs } from "qs";
import { ParamsDictionary, Request } from "express-serve-static-core";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGenerator = functions.handler.https.onRequest(
  async (
    request: Request<
      ParamsDictionary,
      any,
      any,
      {
        adjustHeightToFit?: "true" | "false";
        chromiumPdfOptions?: PDFOptions;
        data?: ParsedQs;
        headful?: "true" | "false";
        outputFileName?: string;
        templateId?: string;
      }
    >,
    response
  ) => {
    let context = "";

    // eslint-disable-next-line require-jsdoc
    function handleError(error: Error) {
      console.error(error);
      response.setHeader("content-type", "application/json");
      response.end(
        JSON.stringify({
          error: error.message,
          context,
        })
      );
    }

    try {
      process.on("uncaughtException", handleError);

      const {
        adjustHeightToFit,
        chromiumPdfOptions,
        data,
        headful,
        outputFileName,
        templateId,
      } = {
        chromiumPdfOptions: {},
        data: {},
        templateId: TEMPLATE_ID,
        ...request.query,
        adjustHeightToFit: request.query.adjustHeightToFit === "true",
        headful: request.query.headful === "true",
      };

      if (templateId != null && typeof templateId !== "string") {
        throw new Error("'templateId' should be a string.");
      }

      if (typeof outputFileName !== "string") {
        throw new Error("'outputFileName' should be set in get parameters.");
      }

      (
        [
          "printBackground",
          "displayHeaderFooter",
          "landscape",
          "preferCSSPageSize",
          "omitBackground",
        ] as const
      ).forEach((keyName) => {
        if (chromiumPdfOptions[keyName] != null) {
          chromiumPdfOptions[keyName] =
            (chromiumPdfOptions[keyName] as unknown) === "true" ? true : false;
        }
      });

      functions.logger.info("Generating pdf from template", { templateId });

      context = "initialize-firebase-storage";
      functions.logger.info("Initializing Firebase Storage");
      const firebaseConfig = {
        storageBucket: TEMPLATE_STORAGE_BUCKET,
      };
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);
      if (process.env.STORAGE_EMULATOR_PORT != null) {
        connectStorageEmulator(
          storage,
          "localhost",
          Number.parseInt(process.env.STORAGE_EMULATOR_PORT)
        );
      }
      functions.logger.info("Firebase Storage initialized successfully");
      context = "";

      context = "load-template";
      functions.logger.info("Loading template file");
      const templateFilesPath = await loadTemplate({
        storage,
        templateId,
        data,
      });
      functions.logger.info("Template file loaded successfully");
      context = "";

      context = "serve-template";
      functions.logger.info("Serving template directory");
      const portNumber = await serveTemplate(templateFilesPath);
      functions.logger.info("Template directory served successfully");
      context = "";

      context = "generate-pdf";
      functions.logger.info("Generating pdf file");
      const pdf = await renderPdf({
        adjustHeightToFit,
        chromiumPdfOptions,
        headless: process.env.IS_LOCAL != "true" || !headful,
        portNumber,
      });
      functions.logger.info("Pdf file generated successfully");
      context = "";

      if (OUTPUT_STORAGE_BUCKET != null) {
        context = "upload-pdf";
        functions.logger.info("Uploading pdf file to Firebase Storage");
        const firebaseConfig = {
          storageBucket: OUTPUT_STORAGE_BUCKET,
        };
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        const pdfRef = ref(storage, outputFileName);
        await uploadBytes(pdfRef, pdf);
        functions.logger.info(
          "Pdf file uploaded to Firebase Storage successfully"
        );
        context = "";
      }

      if (RETURN_PDF_IN_RESPONSE.toLowerCase() === "true") {
        response.setHeader(
          "content-type",
          `application/pdf; filename="${outputFileName}"`
        );
        response.setHeader(
          "content-disposition",
          `inline; filename="${outputFileName}"`
        );
        response.end(pdf);
      } else {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ done: "successful" }));
      }
      process.removeListener("uncaughtException", handleError);
    } catch (error) {
      functions.logger.error("Error", error);
      if (error instanceof Error) {
        handleError(error);
      }
    }
  }
);
