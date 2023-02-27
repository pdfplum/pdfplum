import "module-alias/register";
import * as admin from "firebase-admin";

admin.initializeApp();

import * as fs from "fs";
import * as functions from "firebase-functions";
import { parseParameters } from "./parse_parameters";
import { producePdf } from "lib/produce_pdf";
import { runAction } from "lib/utilities/action";
import { createErrorHandler } from "lib/utilities/error_handler";
import { extensionParameters } from "lib/utilities/extension_parameters";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

import { resolve } from "path";

/**
 * Hello
 * @param {string} dir
 */
async function* getFiles(dir: string): AsyncGenerator<string> {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

exports.executePdfGenerator = functions.firestore
  .document(extensionParameters.FIRESTORE_COLLECTION)
  .onCreate(
    async (
      snapshot: functions.firestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      console.log(__dirname);
      (async () => {
        for await (const f of getFiles(__dirname)) {
          console.log(f);
        }
      })();

      console.log(123, ".");
      (async () => {
        for await (const f of getFiles(".")) {
          console.log(f);
        }
      })();

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

        const parameters = runAction(parseParameters, {
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
