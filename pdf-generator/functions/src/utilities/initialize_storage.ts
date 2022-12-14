import { initializeApp } from "firebase/app";
import {
  connectStorageEmulator,
  getStorage,
  FirebaseStorage,
} from "firebase/storage";

/**
 * Initializes Firebase storage for a bucket. Connects to emulator if running in development environment.
 *
 * @param {string} bucket
 * @return {FirebaseStorage}
 */
export function initializeFirebaseStorage(bucket: string): FirebaseStorage {
  const firebaseConfig = {
    storageBucket: bucket,
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

  return storage;
}
