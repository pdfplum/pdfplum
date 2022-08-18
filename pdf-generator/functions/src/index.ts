const { OUTPUT_STORAGE_BUCKET, RETURN_PDF_IN_RESPONSE, TEMPLATE_PATH } =
  process.env as {
    OUTPUT_STORAGE_BUCKET?: string;
    RETURN_PDF_IN_RESPONSE: string;
    TEMPLATE_PATH: string;
  };

const extensionParameters = {
  OUTPUT_STORAGE_BUCKET,
  RETURN_PDF_IN_RESPONSE,
  TEMPLATE_PATH,
};

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import {
  connectStorageEmulator,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { loadTemplate } from "./load_template";
import { renderPdf } from "./render_pdf";
import { serveTemplate } from "./serve_template";
import { ParamsDictionary, Request } from "express-serve-static-core";
import { GetParameters, parseParameters } from "./parse_parameters";
import { getEventarc } from "firebase-admin/eventarc";

admin.initializeApp();

const eventChannel = process.env.EVENTARC_CHANNEL
  ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
      allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
    })
  : null;

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGenerator = functions.handler.https.onRequest(
  async (
    request: Request<ParamsDictionary, any, any, GetParameters>,
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

      context = "parse-parameters";
      functions.logger.info("Parsing get parameters");
      const {
        adjustHeightToFit,
        chromiumPdfOptions,
        data,
        headful,
        outputFileName,
        templateBucket,
        templatePrefix,
        templateId,
      } = parseParameters({
        query: request.query,
        defaultTemplatePath: TEMPLATE_PATH,
      });
      functions.logger.info("Get parameters parsed successfully");
      context = "";

      functions.logger.info("Generating pdf from template", {
        templateBucket,
        templatePrefix,
        templateId,
      });

      context = "initialize-firebase-storage";
      functions.logger.info("Initializing Firebase Storage");
      const firebaseConfig = {
        storageBucket: templateBucket,
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
        templatePrefix,
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

      let publicUrl: string | undefined;

      if (OUTPUT_STORAGE_BUCKET != null && OUTPUT_STORAGE_BUCKET != "") {
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
        publicUrl = await getDownloadURL(pdfRef);
        context = "";
      }

      const pdfInformation = {
        timestamp: new Date().getTime(),
        publicUrl,
        fileSize: pdf.length,
        parameters: {
          adjustHeightToFit,
          chromiumPdfOptions,
          data,
          fileName: outputFileName,
          templateBucket,
          templatePrefix,
          templateId,
        },
        extensionParameters,
      };

      if (RETURN_PDF_IN_RESPONSE.toLowerCase() === "yes") {
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
        response.end(JSON.stringify({ done: "successful", pdfInformation }));
      }
      if (eventChannel) {
        await eventChannel.publish({
          type: "firebase.extensions.pdf-generator.v1.complete",
          subject: templateId,
          data: pdfInformation,
        });
      }
    } catch (error) {
      if (eventChannel) {
        await eventChannel.publish({
          type: "firebase.extensions.pdf-generator.v1.error",
          subject: TEMPLATE_PATH,
          data: {
            query: request.query,
            extensionParameters,
          },
        });
      }
      functions.logger.error("Error", error);
      if (error instanceof Error) {
        handleError(error);
      }
    } finally {
      process.removeListener("uncaughtException", handleError);
    }
  }
);
