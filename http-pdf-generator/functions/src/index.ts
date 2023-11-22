import "module-alias/register";
import * as admin from "firebase-admin";

admin.initializeApp();

import * as functions from "firebase-functions";
import { ParamsDictionary } from "express-serve-static-core";
import { parseParameters } from "./parse_parameters";
import { producePdf } from "lib/produce_pdf";
import { runAction } from "lib/utilities/action";
import { createErrorHandler } from "lib/utilities/error_handler";
import { extensionParameters } from "lib/utilities/extension_parameters";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGenerator = functions.https.onRequest(
  async (request: functions.Request<ParamsDictionary>, response) => {
    const errorHandler = createErrorHandler({
      response,
      context: {
        method: request.method,
        body: request.body,
        query: request.query,
      },
    });

    if (request.method !== "POST") {
      errorHandler(new Error("Only POST requests are supported."));
      return;
    }

    if (request.headers["content-type"] !== "application/json") {
      errorHandler(new Error("Only JSON requests are supported."));
      return;
    }

    try {
      process.on("uncaughtException", errorHandler);

      // Check type of request
      const postParameters = request.body;

      // Use new version of parameters for parsing
      const parameters = runAction(parseParameters, {
        postParameters: postParameters,
      });

      functions.logger.info("Parameters", parameters);

      const { pdf, functionContext } = await runAction(producePdf, {
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
