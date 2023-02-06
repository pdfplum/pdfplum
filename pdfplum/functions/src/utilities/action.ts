import { types as utilTypes } from "util";
import * as functions from "firebase-functions";
import { contextStack } from "./error_handler";

/**
 * Wraps an action function, logs its start and end and records its context for better error reporting
 *
 * @param {Function} action The action to run
 * @return {Generic} The return value of the action
 */
export function runAction<Arguments, ReturnValue>(
  action: (...args: Arguments[]) => ReturnValue,
  ...args: Arguments[]
): ReturnValue {
  const actionName = action.name
    .split(/(?=[A-Z])/)
    .map((word) => word.replace(/^./, (letter) => letter.toLowerCase()))
    .join(" ");
  functions.logger.info(`Running action '${actionName}'`);
  contextStack.push(actionName);
  const result = action(...args);

  /**
   * Finalizes the action and logs an informative message
   */
  function finalize() {
    contextStack.pop();
    functions.logger.info(`Action '${actionName}' finished successfully`);
  }

  if (utilTypes.isPromise(result)) {
    return new Promise((resolve, reject) => {
      result.then(
        (value) => {
          finalize();
          resolve(value);
        },
        (error) => {
          reject(error);
        }
      );
    }) as ReturnValue;
  } else {
    finalize();
    return result;
  }
}
