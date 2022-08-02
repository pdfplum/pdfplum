/**
 * Required inputs:
 * - STORAGE_BUCKET (extension parameter coming from environment variables) The
 *   Firebase Storage bucket containing the template zip file
 * - TEMPLATE_ID (extension parameter coming from environment variables) The
 *   Firebase Storage zip file path (without '.zip' extension) of the document
 *   that is going to be used as the template
 */
// Inputs

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

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGenerator = functions.handler.https.onRequest(
  async (request, response) => {
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

      functions.logger.info("Generating pdf from template", { TEMPLATE_ID });

      const { _outputFileName, ...data } = request.query;

      if (typeof _outputFileName !== "string") {
        throw new Error("'_outputFileName' should be set in get parameters.");
      }

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
        templateId: TEMPLATE_ID,
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
      const pdf = await renderPdf({ portNumber });
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
        const pdfRef = ref(storage, _outputFileName);
        await uploadBytes(pdfRef, pdf);
        functions.logger.info(
          "Pdf file uploaded to Firebase Storage successfully"
        );
        context = "";
      }

      if (RETURN_PDF_IN_RESPONSE.toLowerCase() === "true") {
        response.setHeader(
          "content-type",
          `application/pdf; filename="${_outputFileName}"`
        );
        response.setHeader(
          "content-disposition",
          `inline; filename="${_outputFileName}"`
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
