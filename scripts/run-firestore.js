#!/usr/bin/env NODE_PATH=./firestore-pdf-generator/functions/node_modules node
const childProcess = require("child_process");
const { promisify } = require("util");
const { readFileSync, writeFileSync } = require("fs");
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore } = require("firebase-admin/firestore");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const path = require("path");

const PROJECT = process.env.PROJECT ?? "demo-test";
const BUCKET = process.env.BUCKET ?? `${PROJECT}.appspot.com`;
const USE_OFFICIAL_UPLOAD_METHOD = process.env.UPLOAD_METHOD
  ? process.env.UPLOAD_METHOD != "fetch"
  : true;

const exec = promisify(childProcess.exec);

process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

admin.initializeApp({ projectId: PROJECT });

/**
 * Call PDF generator endpoint for template path provided as positional argument.
 * If `--headful` is provided it will call the endpoint with `headful` parameter to run the Chromium instance in headful mode.
 * If `--open-pdf` is provided it will try to open the generated PDF returned the response of the http endpoint.
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .scriptName("run")
    .usage("$0 <template_path> [--headful]")
    .positional("templatePath", { type: "string" })
    .boolean("headful")
    .default("headful", false)
    .boolean("open-pdf")
    .default("open-pdf", false)
    .help().argv;

  const headful = argv.headful;
  const openPdf = argv.openPdf;

  const [templatePath] = argv._;
  const templateDirectory = path.dirname(templatePath);
  const templateName = path.basename(templatePath);
  await exec(`rm -f ${templateName}.pdf`, { cwd: "template-samples" });
  await exec(`rm -f ${templateName}.zip`, { cwd: "template-samples" });
  await exec(`cd ${templateName}; zip ../${templateName}.zip -r *`, {
    cwd: templateDirectory,
  });
  const templateContent = readFileSync(`${templatePath}.zip`);

  if (USE_OFFICIAL_UPLOAD_METHOD) {
    const storage = getStorage();
    const bucket = storage.bucket(BUCKET);
    const file = bucket.file(`${templateName}.zip`);
    await file.save(templateContent, {
      resumable: false,
      public: "yes",
    });
  } else {
    await fetch(
      `http://127.0.0.1:9199/v0/b/${PROJECT}.appspot.com/o?name=${templateName}`,
      {
        method: "POST",
        body: templateContent,
      },
    );
  }

  const { data, ...config } = JSON.parse(readFileSync(`${templatePath}.json`));
  const parameters = JSON.stringify({
    ...data,
    _pdfplum_config: {
      ...(headful ? { headful: true } : {}),
      ...config,
      templatePath: `${BUCKET}/${templateName}`,
      outputFileName: `${templateName}-firestore.pdf`,
    },
  });
  console.log("Creating Firestore document with parameters.", parameters);

  const firestore = getFirestore();
  const collection = firestore.collection("pdf-generator");
  await collection.add(JSON.parse(parameters));

  for (let tryCount = 0; tryCount < 4; tryCount++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const filePath = path.join(templateDirectory, `${templateName}.pdf`);
      const file = await getStorage()
        .bucket(BUCKET)
        .file(`${templateName}-firestore.pdf`);
      await file.download({ destination: filePath });
      if (openPdf) await exec(`open ${templateDirectory}/${templateName}.pdf`);
      break;
    } catch (error) {
      if (tryCount === 3) {
        console.error(
          "Failed to download the PDF file after 4 attempts:",
          error,
        );
        return;
      }
      console.log("File not ready yet, retrying in 3 seconds...");
    }
  }
}

main();
