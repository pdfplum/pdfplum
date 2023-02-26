#!/usr/bin/env node

const YAML = require("yaml");
const fs = require("fs");
const extensions = require("./lib").extensions;

for (const extension of extensions) {
  const extensionFileContent = YAML.parse(
    fs.readFileSync(`${extension}/extension.yaml`, { encoding: "utf8" })
  );

  const firebaseExtensionParametersHeader =
    "### Firebase extension parameters\n";
  let parametersMarkdown = firebaseExtensionParametersHeader;
  for (const parameter of extensionFileContent["params"]) {
    parametersMarkdown += `
#### \`${parameter.param}\` ${parameter.required ? "(required)" : "(optional)"}

${parameter.label}<br/>
type: **${parameter.type}**

${parameter.description}
`;
  }

  const preinstallTemplate = fs.readFileSync(`${extension}/PREINSTALL.md`, {
    encoding: "utf8",
  });
  const preinstallContent = preinstallTemplate.replace(
    new RegExp(
      `^${firebaseExtensionParametersHeader}.*?(.(?=\n#{1,3} )|$(?![\r\n]))`,
      "ms"
    ),
    parametersMarkdown
  );
  fs.writeFileSync(`${extension}/PREINSTALL.md`, preinstallContent);
}
