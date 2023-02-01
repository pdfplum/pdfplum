import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { runAction } from "./utilities/action";
import { initializeFirebaseStorage } from "./utilities/initialize_storage";

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
    const storage = runAction(initializeFirebaseStorage, outputBucketName);
    const pdfRef = ref(storage, outputFileName);
    await uploadBytes(pdfRef, pdf);
    publicUrl = await getDownloadURL(pdfRef);
  }

  return publicUrl;
}
