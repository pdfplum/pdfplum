import { getStorage } from "firebase-admin/storage";
import { extensionParameters } from "./utilities/extension_parameters";
import path from "path";

export interface Parameters {
  outputStorageBucket: string | undefined;
  outputStoragePrefix: string | undefined;
  outputFileName: string;
  pdf: Buffer;
}

/**
 * Stores the PDF file in a Firebase Storage bucket.
 */
export async function storePdf({
  outputStorageBucket,
  outputStoragePrefix,
  outputFileName,
  pdf,
}: Parameters): Promise<string | undefined> {
  let publicUrl: string | undefined;

  if (outputStorageBucket != null && outputStorageBucket != "") {
    const bucket = getStorage().bucket(outputStorageBucket);
    const file = bucket.file(
      path.join(outputStoragePrefix ?? "", outputFileName)
    );

    await file.save(pdf, {
      resumable: false,
      public:
        extensionParameters.SHOULD_MAKE_PDF_PUBLIC.toLowerCase() === "yes",
    });

    publicUrl = file.publicUrl();
  }

  return publicUrl;
}
