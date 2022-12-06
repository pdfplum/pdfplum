import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import QueryString from "qs";
import jszip from "jszip";
import Handlebars from "handlebars";
import * as functions from "firebase-functions";
import { initializeApp, FirebaseError } from "firebase/app";
import {
  ref,
  getDownloadURL,
  connectStorageEmulator,
  getStorage,
} from "firebase/storage";

/* eslint-disable @typescript-eslint/no-var-requires */
require("handlebars-helpers").array();
require("handlebars-helpers").collection();
require("handlebars-helpers").comparison();
require("handlebars-helpers").date();
require("handlebars-helpers").math();
require("handlebars-helpers").number();
require("handlebars-helpers").string();
require("handlebars-helpers").url();
/* eslint-enable @typescript-eslint/no-var-requires */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetch = (url: any, init?: any) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

Handlebars.registerHelper("json", function (object) {
  const result = JSON.stringify(object);
  return new Handlebars.SafeString(result);
});

/**
 * Loads template zip file from Firebase Storage bucket, unzips it in a
 * temporary directory and returns the path of the temporary directory.
 */
export async function loadTemplate({
  data,
  templateBucket,
  templatePrefix,
  templateId,
}: {
  data: QueryString.ParsedQs | undefined;
  templateBucket: string;
  templatePrefix: string;
  templateId: string;
}): Promise<string> {
  functions.logger.info("Initializing Firebase Storage");
  const firebaseConfig = {
    storageBucket: templateBucket,
  };
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  if (process.env.STORAGE_EMULATOR_PORT != null) {
    connectStorageEmulator(
      storage,
      "127.0.0.1",
      Number.parseInt(process.env.STORAGE_EMULATOR_PORT)
    );
  }
  functions.logger.info("Firebase Storage initialized successfully");

  functions.logger.info("Loading template file");
  let templateUrl: string;
  try {
    const templateRef = ref(storage, `${templatePrefix}/${templateId}`);
    templateUrl = await getDownloadURL(templateRef);
  } catch (exception) {
    if (
      exception instanceof FirebaseError &&
      exception.code === "storage/object-not-found"
    ) {
      try {
        const templateRef = ref(storage, `${templatePrefix}/${templateId}.zip`);
        templateUrl = await getDownloadURL(templateRef);
      } catch {
        throw exception;
      }
    } else {
      throw exception;
    }
  }
  const response = await fetch(templateUrl);
  const templateBuffer = response.arrayBuffer();

  const temporaryDirectoryPath = fs.mkdtempSync(
    path.join(os.tmpdir(), "pdf-generator-")
  );

  const zipFile = await jszip.loadAsync(templateBuffer);
  const templateFileName = templateId.replace(/\.[^.]+$/, "");
  if (
    zipFile.files["index.html"] == null &&
    zipFile.files[`${templateFileName}/index.html`] == null
  ) {
    throw new Error(
      "There must be an 'index.html' file inside the zip file in its root folder."
    );
  }
  const promises = Object.entries(zipFile.files).map(
    async ([relativePath, file]: [string, jszip.JSZipObject]) => {
      let content: string | Buffer;
      relativePath = relativePath.replace(RegExp(`^${templateFileName}/`), "");
      if (relativePath === "" || relativePath.endsWith("/")) {
        return;
      }
      if (/\.(txt|md|html)$/.test(relativePath)) {
        functions.logger.info("Processing file with handlebars", {
          relativePath,
        });
        content = Handlebars.compile(await file.async("text"))(data);
      } else {
        functions.logger.info("Copying file as is", {
          relativePath,
        });
        content = await file.async("nodebuffer");
      }
      const filePath = path.join(temporaryDirectoryPath, relativePath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
  );

  await Promise.all(promises);

  functions.logger.info("Template file loaded successfully");

  return temporaryDirectoryPath;
}
