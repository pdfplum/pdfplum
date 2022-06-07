/**
 * Required inputs:
 * - GOOGLE_API_KEY (extension parameter coming from environment variables)
 *   Google API key
 * - TEMPLATE_ID (extension parameter coming from environment variables) The
 *   Google Drive file id of the document that is going to be used as the
 *   template
 * - data.json (external file) (values to replace template placeholders)
 */
// Inputs

const {
  TEMPLATE_ID,
  GOOGLE_CLOUD_PRIVATE_KEY,
  GOOGLE_CLOUD_CLIENT_EMAIL,
} = process.env as {
  TEMPLATE_ID: string;
  GOOGLE_CLOUD_PRIVATE_KEY: string;
  GOOGLE_CLOUD_CLIENT_EMAIL: string;
};

import {Readable} from "stream";
import * as functions from "firebase-functions";
import {google} from "googleapis";
import * as Docxtemplater_ from "docxtemplater";
import {default as Docxtemplater__} from "docxtemplater";
import * as PizZip from "pizzip";
import {
  GOOGLE_DOCS_EDITORS_MIME_TYPES,
  MICROSOFT_OFFICE_MIME_TYPES,
  MICROSOFT_OFFICE_TEMPLATE_MIME_TYPES,
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

export const executePdfGenerator =
functions.https.onRequest(async (request, response) => {
  try {
    functions.logger.info("Generating pdf from template", {TEMPLATE_ID});

    const credentials = {
      private_key: GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: GOOGLE_CLOUD_CLIENT_EMAIL,
    };
    const auth = new google.auth.GoogleAuth({
      credentials, scopes: [
        "https://www.googleapis.com/auth/drive",
      ],
    });
    const drive = google.drive({version: "v3", auth});
    functions.logger.info("Google Drive API initialized successfully");

    const templateMetaData = await drive.files.get({fileId: TEMPLATE_ID});

    functions.logger.info(
        "Template meta data loaded successfully",
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
          .entries(GOOGLE_DOCS_EDITORS_MIME_TYPES)
          .find(([, value]) => value === templateMetaData.data.mimeType) as
        [TemplateType, string])[0];
      template = (await drive.files.export({
        fileId: TEMPLATE_ID,
        mimeType: MICROSOFT_OFFICE_MIME_TYPES[templateType],
      }, {responseType: "arraybuffer"})).data as ArrayBuffer;
    } else if (Object.values(MICROSOFT_OFFICE_MIME_TYPES)
        .includes(templateMetaData.data.mimeType)) {
      templateType = (Object
          .entries(MICROSOFT_OFFICE_MIME_TYPES)
          .find(([, value]) => value === templateMetaData.data.mimeType) as
        [TemplateType, string])[0];
      template = (await drive.files.get({
        fileId: TEMPLATE_ID,
        alt: "media",
      }, {responseType: "arraybuffer"})).data as ArrayBuffer;
    } else if (Object.values(MICROSOFT_OFFICE_TEMPLATE_MIME_TYPES)
        .includes(templateMetaData.data.mimeType)) {
      templateType = (Object
          .entries(MICROSOFT_OFFICE_TEMPLATE_MIME_TYPES)
          .find(([, value]) => value === templateMetaData.data.mimeType) as
        [TemplateType, string])[0];
      template = (await drive.files.get({
        fileId: TEMPLATE_ID,
        alt: "media",
      }, {responseType: "arraybuffer"})).data as ArrayBuffer;
    } else {
      throw new Error(`Unsupported template mime type, supported mime types: \
${Object.values(GOOGLE_DOCS_EDITORS_MIME_TYPES).join(", ")}, \
${Object.values(MICROSOFT_OFFICE_MIME_TYPES).join(", ")}, \
${Object.values(MICROSOFT_OFFICE_TEMPLATE_MIME_TYPES).join(", ")}`);
    }

    functions.logger.info("Template loaded successfully");

    const zip = new PizZip(template);

    const document = new Docxtemplater(zip, {linebreaks: true},);

    document.render(request.query);

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
        mimeType: MICROSOFT_OFFICE_MIME_TYPES[templateType],
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
