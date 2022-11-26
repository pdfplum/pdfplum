#!/usr/bin/env node
const child_process = require("child_process");
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
const path = require("path");

const PROJECT = "demo-pdf-generator-c5d7d";
const BUCKET = `${PROJECT}.appspot.com`;
const USE_OFFICIAL_UPLOAD_METHOD = true;

const exec = promisify(child_process.exec);

async function main() {
  const templatePath = process.argv[2] || process.env.TEMPLATE;
  const templateDirectory = path.dirname(templatePath);
  const templateName = path.basename(templatePath);
  await exec("rm -f /tmp/result.pdf");
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
    console.log("Normal upload failed.");
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
    templatePath: `${BUCKET}/${templateName}`,
    outputFileName: `${templateName}.pdf`,
  });
  const response = await fetch(
    `http://127.0.0.1:5001/${PROJECT}/us-central1/ext-pdf-generator-executePdfGenerator?${parameters}`
  );
  if (response.status === 200) {
    writeFileSync("/tmp/result.pdf", Buffer.from(await response.arrayBuffer()));
    await exec("open /tmp/result.pdf");
  } else {
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${await response.text()}`);
  }
}

main();
