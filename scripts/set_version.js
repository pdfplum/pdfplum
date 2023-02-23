#!/usr/bin/env node
const fs = require("fs");
const YAML = require("yaml");
JSON_FILES = [
  "package.json",
  "package-lock.json",
  "pdf-generator/functions/package.json",
  "pdf-generator/functions/package-lock.json",
];
YAML_FILES = ["pdf-generator/extension.yaml"];

const changeLogContent = fs.readFileSync("pdf-generator/CHANGELOG.md", {
  encoding: "utf8",
});

const version = /## Version (\d+\.\d+\.\d+)/.exec(changeLogContent)[1];

for (let path of JSON_FILES) {
  const parsedJson = JSON.parse(fs.readFileSync(path));
  parsedJson.version = version;
  fs.writeFileSync(path, JSON.stringify(parsedJson, null, 2) + "\n");
}
for (let path of YAML_FILES) {
  const parsedYaml = YAML.parseDocument(
    fs.readFileSync(path, { encoding: "utf8" })
  );
  parsedYaml.set("version", version);
  fs.writeFileSync(path, parsedYaml.toString());
}
