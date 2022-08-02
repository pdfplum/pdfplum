import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import QueryString from "qs";
import { ref, getDownloadURL, FirebaseStorage } from "firebase/storage";
import jszip from "jszip";
import Handlebars from "handlebars";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetch = (url: any, init?: any) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

/**
 * loads tempalte zip file from Firebase Storage bucket, unzips it in a
 * temporary directory and returns the path of the temporary directory
 */
export async function loadTemplate({
  data,
  storage,
  templateId,
}: {
  data: QueryString.ParsedQs;
  storage: FirebaseStorage;
  templateId: string;
}): Promise<string> {
  const templateRef = ref(storage, `${templateId}.zip`);
  const templateUrl = await getDownloadURL(templateRef);
  const response = await fetch(templateUrl);
  const templateBuffer = response.arrayBuffer();

  const temporaryDirectoryPath = os.tmpdir();

  const zipFile = await jszip.loadAsync(templateBuffer);
  const promises = Object.entries(zipFile.files).map(
    async ([relativePath, file]: [string, jszip.JSZipObject]) => {
      let content: string | Buffer;
      relativePath = relativePath.replace(RegExp(`^${templateId}/`), "");
      if (relativePath === "" || relativePath.endsWith("/")) {
        return;
      }
      if (relativePath === "index.html") {
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
