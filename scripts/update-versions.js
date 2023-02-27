#!/usr/bin/env node

const fs = require("fs");
const YAML = require("yaml");
const extensions = require("./lib").extensions;

const JSON_FILES = ["package.json", "package-lock.json"];
const YAML_FILES = [];
const EXTENSION_JSON_FILES = [
  "functions/package.json",
  "functions/package-lock.json",
];
const EXTENSION_YAML_FILES = ["extension.yaml", "_extension.yaml"];

const changeLogContent = fs.readFileSync("CHANGELOG.md", {
  encoding: "utf8",
});

const version = /## Version (\d+\.\d+\.\d+)/.exec(changeLogContent)[1];

/**
 * Update "version" field of a JSON file.
 * @param {string} path path of the JSON file
 * @param {string} version version to be set
 */
function updateJsonFile(path, version) {
  const parsedJson = JSON.parse(fs.readFileSync(path));
  parsedJson.version = version;
  fs.writeFileSync(path, JSON.stringify(parsedJson, null, 2) + "\n");
}

/**
 * Update "version" field of a YAML file.
 * @param {string} path path of the YAML file
 * @param {string} version version to be set
 */
function updateYamlFile(path, version) {
  const parsedYaml = YAML.parseDocument(
    fs.readFileSync(path, { encoding: "utf8" })
  );
  parsedYaml.set("version", version);
  fs.writeFileSync(path, parsedYaml.toString());
}

JSON_FILES.map((path) => updateJsonFile(path, version));
YAML_FILES.map((path) => updateYamlFile(path, version));

for (const extension of extensions) {
  const version = new RegExp(
    `## Version (\\d+\\.\\d+\\.\\d+).*<!--subject:${extension}-->`
  ).exec(changeLogContent)[1];
  EXTENSION_JSON_FILES.map((path) => `${extension}/${path}`).map((path) =>
    updateJsonFile(path, version)
  );
  EXTENSION_YAML_FILES.map((path) => `${extension}/${path}`).map((path) =>
    updateYamlFile(path, version)
  );
}
