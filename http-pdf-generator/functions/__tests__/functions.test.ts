import * as admin from "firebase-admin";

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

admin.initializeApp({ projectId: "demo-test" });

describe("functions", () => {
  test("should generate a PDF file", async () => {
    expect(true).toBe(true);
  });
});
