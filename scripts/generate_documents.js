#!/usr/bin/env node

const YAML = require("yaml");
const fs = require("fs");

const extensionFileContent = YAML.parse(
  fs.readFileSync("pdf-generator/extension.yaml", { encoding: "utf8" })
);

const firebaseExtensionParametersHeader = "### Firebase Extension parameters\n";
let parametersMarkdown = firebaseExtensionParametersHeader;
for (const parameter of extensionFileContent["params"]) {
  parametersMarkdown += `
#### \`${parameter.param}\` ${parameter.required ? "(required)" : "(optional)"}

${parameter.label}<br/>
type: **${parameter.type}**

${parameter.description}
`;
}

const preinstallTemplate = fs.readFileSync("pdf-generator/PREINSTALL.md", {
  encoding: "utf8",
});
const preinstallContent = preinstallTemplate.replace(
  new RegExp(
    `^${firebaseExtensionParametersHeader}.*?(.(?=\n#{1,3} )|$(?![\r\n]))`,
    "ms"
  ),
  parametersMarkdown
);
fs.writeFileSync("pdf-generator/PREINSTALL.md", preinstallContent);