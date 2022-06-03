/**
 * Required inputs:
 * - credentials.json (external file) Google API credentials
 * - template_id (query parameter) The Google Drive file id of the document that
 *   is going to be used as the tempalte
 * - data.json (external file) (values to replace template placeholders)
 */
// Inputs

import * as data from "./data.json";
import {Readable} from "stream";
import * as functions from "firebase-functions";
import * as fs from "fs";
import {google} from "googleapis";
import * as Docxtemplater_ from "docxtemplater";
import {default as Docxtemplater__} from "docxtemplater";
import * as PizZip from "pizzip";
import {
  GOOGLE_DOCS_EDITORS_MIME_TYPES,
  MICROSFOT_OFFICE_MIME_TYPES,
  TemplateType,
} from "./mimeTypes";

const Docxtemplater = Docxtemplater_ as unknown as typeof Docxtemplater__;

process
    .on("unhandledRejection", (reason, p) => {
      console.error(reason, "Unhandled Rejection at Promise", p);
    })
    .on("uncaughtException", (err) => {
      console.error(err, "Uncaught Exception thrown");
      process.exit(1);
    });

export const generatePdfFromTemplate =
functions.https.onRequest(async (request, response) => {
  try {
    const templateId = request.query["template_id"];
    functions.logger.info("Generating pdf from template", {templateId});

    if (templateId == null || typeof templateId !== "string") {
      throw new Error("'template_id' query parameter is required (only one)");
    }

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

    functions.logger.info("Google Drive API initialized successfully");

    const templateMetaData = await drive.files.get({fileId: templateId});

    functions.logger.info(
        "Tempalte meta data loaded successfully",
        templateMetaData,
    );

    if (!templateMetaData.data.mimeType) {
      throw new Error("Template file doesn't have a mime type");
    }

    let template: ArrayBuffer;
    let templateType: TemplateType;

    if (Object.values(GOOGLE_DOCS_EDITORS_MIME_TYPES)
        .includes(templateMetaData.data.mimeType)) {
      templateType = (Object
          .entries(GOOGLE_DOCS_EDITORS_MIME_TYPES) as [TemplateType, string][])
          .find(([, value]) => value === templateMetaData.data.mimeType)![0];
      template = (await drive.files.export({
        fileId: templateId,
        mimeType: MICROSFOT_OFFICE_MIME_TYPES[templateType],
      }, {responseType: "arraybuffer"})).data as ArrayBuffer;
    } else if (Object.values(MICROSFOT_OFFICE_MIME_TYPES)
        .includes(templateMetaData.data.mimeType)) {
      templateType = (Object
          .entries(MICROSFOT_OFFICE_MIME_TYPES) as [TemplateType, string][])
          .find(([, value]) => value === templateMetaData.data.mimeType)![0];
      template = (await drive.files.get({
        fileId: templateId,
        alt: "media",
      }, {responseType: "arraybuffer"})).data as ArrayBuffer;
    } else {
      throw new Error(`Unsupported template mime type, supported mime types: \
${Object.values(GOOGLE_DOCS_EDITORS_MIME_TYPES).join(", ")}, \
${Object.values(MICROSFOT_OFFICE_MIME_TYPES).join(", ")}`);
    }

    functions.logger.info("Tempalte loaded successfully");

    const zip = new PizZip(template);

    const document = new Docxtemplater(zip, {linebreaks: true},);

    document.render(data);

    const base64 = (document.getZip() as PizZip)
        .generate({type: "base64"});

    const buffer = Buffer.from(base64, "base64");
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const createdDocument = await drive.files.create({
      requestBody: {
        mimeType: GOOGLE_DOCS_EDITORS_MIME_TYPES[templateType],
        name: "This",
      },
      media: {
        mimeType: MICROSFOT_OFFICE_MIME_TYPES[templateType],
        body: stream,
      },
      fields: "id",
    });

    functions.logger.info("Google document created successfully");

    if (!createdDocument.data.id) {
      return;
    }

    const pdf = await drive.files.export({
      fileId: createdDocument.data.id,
      mimeType: "application/pdf",
    }, {responseType: "stream"});

    functions.logger.info("Pdf generated successfully");

    response.setHeader("content-type", "application/pdf");
    pdf.data.pipe(response);

    functions.logger.info("Pdf served successfully");

    await drive.files.delete({fileId: createdDocument.data.id});
    functions.logger.info("Temporary document deleted successfully");
  } catch (error) {
    functions.logger.error("Error", error);
    if (error instanceof Error) {
      response.send(`Error: ${error.message}`);
    }
  }
});
