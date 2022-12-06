import * as functions from "firebase-functions";
import { initializeApp } from "firebase/app";
import {
  connectStorageEmulator,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

export interface Parameters {
  outputFileName: string;
  outputBucketName: string | undefined;
  pdf: Buffer;
}

/**
 * Stores the pdf in a Firebase Storage bucket.
 */
export async function storePdf({
  outputFileName,
  outputBucketName,
  pdf,
}: Parameters): Promise<string | undefined> {
  let publicUrl: string | undefined;

  console.log(outputBucketName);

  if (outputBucketName != null && outputBucketName != "") {
    functions.logger.info("Uploading pdf file to Firebase Storage");
    const firebaseConfig = {
      storageBucket: outputBucketName,
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
    const pdfRef = ref(storage, outputFileName);
    await uploadBytes(pdfRef, pdf);
    functions.logger.info("Pdf file uploaded to Firebase Storage successfully");
    publicUrl = await getDownloadURL(pdfRef);
  }

  return publicUrl;
}
