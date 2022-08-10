import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import QueryString from "qs";
import { ref, getDownloadURL, FirebaseStorage } from "firebase/storage";
import jszip from "jszip";
import Handlebars from "handlebars";
import * as functions from "firebase-functions";
import { FirebaseError } from "firebase/app";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetch = (url: any, init?: any) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

/**
 * loads template zip file from Firebase Storage bucket, unzips it in a
 * temporary directory and returns the path of the temporary directory
 */
export async function loadTemplate({
  data,
  storage,
  templateId,
}: {
  data: QueryString.ParsedQs | undefined;
  storage: FirebaseStorage;
  templateId: string;
}): Promise<string> {
  let templateUrl: string;
  try {
    const templateRef = ref(storage, `${templateId}`);
    templateUrl = await getDownloadURL(templateRef);
  } catch (exception) {
    if (
      exception instanceof FirebaseError &&
      exception.code === "storage/object-not-found"
    ) {
      const templateRef = ref(storage, `${templateId}.zip`);
      templateUrl = await getDownloadURL(templateRef);
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
  if (
    zipFile.files["index.html"] == null &&
    zipFile.files[`${templateId}/index.html`] == null
  ) {
    throw new Error(
      "There must be an 'index.html' file inside the zip file in its root folder."
    );
  }
  const promises = Object.entries(zipFile.files).map(
    async ([relativePath, file]: [string, jszip.JSZipObject]) => {
      let content: string | Buffer;
      relativePath = relativePath.replace(RegExp(`^${templateId}/`), "");
      if (relativePath === "" || relativePath.endsWith("/")) {
        return;
      }
      functions.logger.info("Processing file with handlebars", {
        relativePath,
      });
      if (/\.(txt|md|html)$/.test(relativePath)) {
        content = Handlebars.compile(await file.async("text"))(data);
      } else {
        content = await file.async("nodebuffer");
      }
      const filePath = path.join(temporaryDirectoryPath, relativePath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }
  );

  await Promise.all(promises);

  return temporaryDirectoryPath;
}
