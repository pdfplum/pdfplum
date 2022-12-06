import { types as utilTypes } from "util";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ParamsDictionary, Request } from "express-serve-static-core";
import {
  extensionParameters,
  GetParameters,
  ParsedParameters,
  parseParameters,
} from "./parse_parameters";
import { getEventarc } from "firebase-admin/eventarc";
import { producePdf } from "./produce_pdf";

admin.initializeApp();

export const eventChannel = process.env.EVENTARC_CHANNEL
  ? getEventarc().channel(process.env.EVENTARC_CHANNEL, {
      allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
    })
  : null;

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

let contextStack: string[];

/**
 * Wraps an action function and records its context for better error reporting
 *
 * @param {Function} action The action to run
 * @return {Generic} The return value of the action
 */
export function runAction<Arguments, ReturnValue>(
  action: (...args: Arguments[]) => ReturnValue,
  ...args: Arguments[]
): ReturnValue {
  contextStack.push(
    action.name
      .split(/(?=[A-Z])/)
      .map((word) => word.replace(/^./, (letter) => letter.toLowerCase()))
      .join(" ")
  );
  const result = action(...args);
  if (utilTypes.isPromise(result)) {
    return new Promise((resolve, reject) => {
      result.then(
        (value) => {
          contextStack.pop();
          resolve(value);
        },
        (error) => {
          reject(error);
        }
      );
    }) as ReturnValue;
  } else {
    contextStack.pop();
    return result;
  }
}
/**
 * Returns an error handler to be called whenever an exception is raised
 *
 * @return {Function} The error handler callback
 */
function createErrorHandler({
  context,
  response,
}: {
  context: { [key: string]: unknown };
  response?: functions.Response<unknown>;
}): (error: Error) => void {
  contextStack = [];
  return async function handleError(error: Error) {
    functions.logger.error(error);
    response?.status(500);
    response?.setHeader("content-type", "application/json");
    response?.end(
      JSON.stringify({
        error: error.message,
        context: contextStack.join(" -> "),
      })
    );

    if (eventChannel) {
      await eventChannel.publish({
        type: "firebase.extensions.pdf-generator.v1.error",
        subject: "error",
        data: { ...context, extensionParameters },
      });
    }
  };
}

exports.executePdfGeneratorHttp = functions.handler.https.onRequest(
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
        extensionParameters,
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

exports.executePdfGeneratorFirestore =
  functions.handler.firestore.document.onCreate(
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
          extensionParameters,
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
