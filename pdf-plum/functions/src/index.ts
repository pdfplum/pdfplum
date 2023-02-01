import * as functions from "firebase-functions";
import { ParamsDictionary, Request } from "express-serve-static-core";
import {
  GetParameters,
  ParsedParameters,
  parseParameters,
} from "./parse_parameters";
import { producePdf } from "./produce_pdf";
import { runAction } from "./utilities/action";
import { createErrorHandler } from "./utilities/error_handler";
import { extensionParameters } from "./utilities/extension_parameters";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGeneratorHttp = functions.https.onRequest(
  async (
    request: Request<ParamsDictionary, unknown, unknown, GetParameters>,
    response
  ) => {
    const errorHandler = createErrorHandler({
      response,
      context: {
        query: request.query,
      },
    });

    try {
      process.on("uncaughtException", errorHandler);

      const parameters = runAction(parseParameters, {
        rawParameters: request.query,
      });

      const { pdf, functionContext } = await runAction(producePdf, {
        outputBucketName: extensionParameters.OUTPUT_STORAGE_BUCKET,
        parameters,
      });

      if (extensionParameters.RETURN_PDF_IN_RESPONSE.toLowerCase() === "yes") {
        response.setHeader(
          "content-type",
          `application/pdf; filename="${parameters.outputFileName}"`
        );
        response.setHeader(
          "content-disposition",
          `inline; filename="${parameters.outputFileName}"`
        );
        response.end(pdf);
      } else {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ done: "successful", functionContext }));
      }
    } catch (error) {
      functions.logger.error("Error", error);
      if (error instanceof Error) {
        errorHandler(error);
      }
    } finally {
      process.removeListener("uncaughtException", errorHandler);
    }
  }
);

exports.executePdfGeneratorFirestore = functions.firestore
  .document(extensionParameters.FIRESTORE_COLLECTION)
  .onCreate(
    async (
      snapshot: functions.firestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const id = snapshot.id;
      const data = snapshot.data();
      const errorHandler = createErrorHandler({
        context: {
          id,
          data,
          context,
        },
      });

      try {
        process.on("uncaughtException", errorHandler);

        const parameters: ParsedParameters = runAction(parseParameters, {
          rawParameters: { data, id },
        });

        await runAction(producePdf, {
          outputBucketName: extensionParameters.OUTPUT_STORAGE_BUCKET,
          parameters,
        });
      } catch (error) {
        functions.logger.error("Error", error);
        if (error instanceof Error) {
          errorHandler(error);
        }
      } finally {
        process.removeListener("uncaughtException", errorHandler);
      }
    }
  );
