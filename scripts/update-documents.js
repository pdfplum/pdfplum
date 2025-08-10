#!/usr/bin/env node

const YAML = require("yaml");
const fs = require("fs");
const extensions = require("./lib").extensions;

for (const extension of extensions) {
  let changelog = fs.readFileSync("CHANGELOG.md", { encoding: "utf8" });
  changelog = changelog
    .replace(
      new RegExp(
        `## (?!Version \\d+\\.\\d+\\.\\d+[^\n]*<!--subject:${extension}-->)((.|\n)(?!##))*\n`,
        "gm",
      ),
      "",
    )
    .replace(
      /(## Version \d+\.\d+\.\d+)\s*<!--subject[^\n]*-->(\n((.|\n)(?!##))*\n)/g,
      (_, header, content) => header.trim() + content,
    );
  fs.writeFileSync(`${extension}/CHANGELOG.md`, changelog);

  const extensionFileContent = YAML.parse(
    fs.readFileSync(`${extension}/extension.yaml`, { encoding: "utf8" }),
  );

  const firebaseExtensionParametersHeader =
    "## Firebase extension parameters\n";
  let parametersMarkdown = firebaseExtensionParametersHeader;
  for (const parameter of extensionFileContent["params"]) {
    parametersMarkdown += `
### \`${parameter.param}\` ${parameter.required ? "(required)" : "(optional)"}

${parameter.label}<br/>
type: **${parameter.type}**

${parameter.description}${parameter.example ? `\n\nExample: \`${parameter.example}\`` : ""}
`;
  }

  const preinstallTemplate = fs.readFileSync(`${extension}/PARAMETERS.md`, {
    encoding: "utf8",
  });
  const preinstallContent = preinstallTemplate.replace(
    new RegExp(
      `^${firebaseExtensionParametersHeader}.*?(.(?=\n#{1,2} )|$(?![\r\n]))`,
      "ms",
    ),
    parametersMarkdown,
  );
  fs.writeFileSync(`${extension}/PARAMETERS.md`, preinstallContent);
}
