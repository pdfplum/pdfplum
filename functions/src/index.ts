/**
 * Required inputs:
 * - credentials.json (external file)
 * - TEMPLATE_ID (The Google Drive id of the document that is going to be used
 *   as the tempalte)
 * - TEMPLATE_TYPE ("document", "sheet" or "slide")
 * - DATA (Values to replace template placeholders)
 */
// Inputs
const TEMPLATE_ID = "1Cnl5wYnUvADWL3ZX9EG-guMWT1AQQfe1Ys-_NaiK0-A";
const TEMPLATE_TYPE: "document" | "sheet" | "slide" = "document";
const DATA = {firstname: "Sassan", color: "red"};

import {Readable} from "stream";
import * as functions from "firebase-functions";
import * as fs from "fs";
import {google} from "googleapis";
import * as Docxtemplater from "docxtemplater";
import * as PizZip from "pizzip";

const GOOGLE_DOCS_EDITORS_MIME_TYPES = {
  document: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
  slide: "application/vnd.google-apps.presentation",
};

const MICROSFOT_OFFICE_MIME_TYPES = {
  document:
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  sheet: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  slide:
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

process
    .on("unhandledRejection", (reason, p) => {
      console.error(reason, "Unhandled Rejection at Promise", p);
    })
    .on("uncaughtException", (err) => {
      console.error(err, "Uncaught Exception thrown");
      process.exit(1);
    });

export const helloWorld = functions.https.onRequest(async (_, response) => {
  // functions.logger.info("Hello logs!", {structuredData: true});

  const credentials = JSON.parse(
      fs.readFileSync("./credentials.json").toString(),
  );
  const auth = new google.auth.GoogleAuth({
    credentials, scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
  const authClient = await auth.getClient();

  const drive = google.drive({version: "v3", auth: authClient});

  try {
    const template = await drive.files.export({
      fileId: TEMPLATE_ID,
      mimeType: MICROSFOT_OFFICE_MIME_TYPES[TEMPLATE_TYPE],
    }, {responseType: "arraybuffer"});

    const zip = new PizZip(template.data as ArrayBuffer);

    const document = new Docxtemplater(zip, {linebreaks: true});

    document.render(DATA);

    const base64 = (document.getZip() as PizZip)
        .generate({type: "base64"});

    const buffer = Buffer.from(base64, "base64");
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const createdDocument = await drive.files.create({
      requestBody: {
        mimeType: GOOGLE_DOCS_EDITORS_MIME_TYPES[TEMPLATE_TYPE],
        name: "This",
      },
      media: {
        mimeType: MICROSFOT_OFFICE_MIME_TYPES[TEMPLATE_TYPE],
        body: stream,
      },
      fields: "id",
    });
    if (!createdDocument.data.id) {
      return;
    }

    const pdf = await drive.files.export({
      fileId: createdDocument.data.id,
      mimeType: "application/pdf",
    }, {responseType: "stream"});

    response.setHeader("content-type", "application/pdf");
    pdf.data.pipe(response);

    await drive.files.delete({fileId: createdDocument.data.id});
  } catch (error) {
    console.log("Error during download", error);
  }
});
