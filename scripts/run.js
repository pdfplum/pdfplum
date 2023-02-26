#!/usr/bin/env NODE_PATH=./http-pdf-generator/functions/node_modules node
const childProcess = require("child_process");
const { promisify } = require("util");
const { readFileSync, writeFileSync } = require("fs");
const { initializeApp } = require("firebase/app");
const {
  connectStorageEmulator,
  getStorage,
  ref,
  uploadBytes,
} = require("firebase/storage");
const qs = require("qs");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const path = require("path");

const PROJECT = "demo-test";
const BUCKET = `${PROJECT}.appspot.com`;
const USE_OFFICIAL_UPLOAD_METHOD = true;

const exec = promisify(childProcess.exec);

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
  await exec(`zip ${templateName}.zip -r ${templateName}/*`, {
    cwd: templateDirectory,
  });
  const templateContent = readFileSync(`${templatePath}.zip`);

  if (USE_OFFICIAL_UPLOAD_METHOD) {
    const firebaseConfig = {
      storageBucket: BUCKET,
      project: PROJECT,
    };
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    const templateRef = ref(storage, `${templateName}.zip`);
    await uploadBytes(templateRef, templateContent);
  } else {
    await fetch(
      `http://127.0.0.1:9199/v0/b/${PROJECT}.appspot.com/o?name=${templateName}`,
      {
        method: "POST",
        body: templateContent,
      }
    );
  }

  const parameters = qs.stringify({
    ...JSON.parse(readFileSync(`${templatePath}.json`)),
    ...(headful ? { headful: true } : {}),
    templatePath: `${BUCKET}/${templateName}`,
    outputFileName: `${templateName}.pdf`,
  });
  console.log(
    `Fetching "http://127.0.0.1:5001/${PROJECT}/us-central1/ext-http-pdf-generator-executePdfGeneratorHttp?${parameters}"`
  );
  const response = await fetch(
    `http://127.0.0.1:5001/${PROJECT}/us-central1/ext-http-pdf-generator-executePdfGeneratorHttp?${parameters}`
  );
  if (response.status === 200) {
    writeFileSync(
      `${templateDirectory}/${templateName}.pdf`,
      Buffer.from(await response.arrayBuffer())
    );
    if (openPdf) await exec(`open ${templateDirectory}/${templateName}.pdf`);
  } else {
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${await response.text()}`);
  }
}

main();
