#!/usr/bin/env node

const fs = require("fs");
const YAML = require("yaml");
const extensions = require("./lib").extensions;

const JSON_FILES = [
  // "functions/package.json",
  // "functions/package-lock.json",
];
const YAML_FILES = ["extension.yaml"];

for (const extension of extensions) {
  for (const entry of JSON_FILES) {
    const templatePath = `common-stuff/${entry}`;
    const document = JSON.parse(fs.readFileSync(templatePath));

    const entryPath = `${extension}/_${entry}`;
    const entryDocument = JSON.parse(fs.readFileSync(entryPath));

    const outputPath = `${extension}/${entry}`;

    fs.writeFileSync(
      outputPath,
      JSON.stringify({ ...document, ...entryDocument }, null, 2) + "\n"
    );
  }
  for (const entry of YAML_FILES) {
    const templatePath = `common-stuff/${entry}`;
    const document = YAML.parseDocument(
      fs.readFileSync(templatePath, { encoding: "utf8" })
    );

    const entryPath = `${extension}/_${entry}`;
    const entryDocument = YAML.parseDocument(
      fs.readFileSync(entryPath, { encoding: "utf8" })
    );

    for (const entry of entryDocument.contents.items) {
      if (YAML.isScalar(entry.value)) {
        document.set(entry.key, entry.value);
      } else if (YAML.isSeq(entry.value)) {
        document.get(entry.key).flow = false;
        for (const i of entry.value.items) {
          document.addIn([entry.key], i);
        }
      }
    }

    const outputPath = `${extension}/${entry}`;

    fs.writeFileSync(outputPath, document.toString());
  }
}
