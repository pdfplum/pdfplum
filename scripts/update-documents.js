#!/usr/bin/env node

const fs = require("fs");
const extensions = require("./lib").extensions;

for (const extension of extensions) {
  let changelog = fs.readFileSync("CHANGELOG.md", { encoding: "utf8" });
  changelog = changelog
    .replace(
      new RegExp(
        `## (?!Version \\d+\\.\\d+\\.\\d+[^\n]*<!--subject:${extension}-->)((.|\n)(?!##))*\n`,
        "gm"
      ),
      ""
    )
    .replace(
      /(## Version \d+\.\d+\.\d+)\s*<!--subject[^\n]*-->(\n((.|\n)(?!##))*\n)/g,
      (_, header, content) => header.trim() + content
    );
  fs.writeFileSync(`${extension}/CHANGELOG.md`, changelog);
}
