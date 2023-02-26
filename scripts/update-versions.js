#!/usr/bin/env node
const fs = require("fs");
const YAML = require("yaml");
const JSON_FILES = [
  "package.json",
  "package-lock.json",
  "firestore-pdf-generator/functions/package.json",
  "firestore-pdf-generator/functions/package-lock.json",
  "http-pdf-generator/functions/package.json",
  "http-pdf-generator/functions/package-lock.json",
];
const YAML_FILES = [
  "common-stuff/extension.yaml",
  "firestore-pdf-generator/extension.yaml",
  "http-pdf-generator/extension.yaml",
];

const changeLogContent = fs.readFileSync("CHANGELOG.md", {
  encoding: "utf8",
});

const version = /## Version (\d+\.\d+\.\d+)/.exec(changeLogContent)[1];

for (const path of JSON_FILES) {
  const parsedJson = JSON.parse(fs.readFileSync(path));
  parsedJson.version = version;
  fs.writeFileSync(path, JSON.stringify(parsedJson, null, 2) + "\n");
}
for (const path of YAML_FILES) {
  const parsedYaml = YAML.parseDocument(
    fs.readFileSync(path, { encoding: "utf8" })
  );
  parsedYaml.set("version", version);
  fs.writeFileSync(path, parsedYaml.toString());
}
