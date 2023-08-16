import "module-alias/register";
import * as admin from "firebase-admin";

admin.initializeApp();

import * as functions from "firebase-functions";
import { FirestoreDocument, parseParameters } from "./parse_parameters";
import { producePdf } from "lib/produce_pdf";
import { runAction } from "lib/utilities/action";
import { createErrorHandler } from "lib/utilities/error_handler";
import { extensionParameters } from "lib/utilities/extension_parameters";

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, "Unhandled Rejection at Promise", p);
});

exports.executePdfGenerator = functions.firestore
  .document(extensionParameters.FIRESTORE_COLLECTION)
  .onCreate(
    async (
      snapshot: functions.firestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const id = snapshot.id;
      const rawParameters = snapshot.data() as FirestoreDocument;
      const errorHandler = createErrorHandler({
        context: {
          id,
          rawParameters,
          context,
        },
      });

      try {
        process.on("uncaughtException", errorHandler);

        const parameters = runAction(parseParameters, {
          rawParameters,
          id,
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
