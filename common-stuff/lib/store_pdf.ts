import { getStorage } from "firebase-admin/storage";
import { extensionParameters } from "./utilities/extension_parameters";

export interface Parameters {
  outputFileName: string;
  outputBucketName: string | undefined;
  pdf: Buffer;
}

/**
 * Stores the PDF file in a Firebase Storage bucket.
 */
export async function storePdf({
  outputFileName,
  outputBucketName,
  pdf,
}: Parameters): Promise<string | undefined> {
  let publicUrl: string | undefined;

  if (outputBucketName != null && outputBucketName != "") {
    const outputBucket = getStorage().bucket(outputBucketName);
    const file = outputBucket.file(outputFileName);

    await file.save(pdf, {
      resumable: false,
      public:
        extensionParameters.SHOULD_MAKE_PDF_PUBLIC.toLowerCase() === "yes",
    });

    publicUrl = file.publicUrl();
  }

  return publicUrl;
}
