import * as functions from "firebase-functions";
import { eventChannel, EVENT_TYPE_PREFIX } from "./event_channel";
import { extensionParameters } from "./extension_parameters";

export let contextStack: string[];

/**
 * Returns an error handler to be called whenever an exception is raised
 *
 * @return {Function} The error handler callback
 */
export function createErrorHandler({
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
        type: `${EVENT_TYPE_PREFIX}error`,
        subject: "error",
        data: { ...context, extensionParameters },
      });
    }
  };
}
