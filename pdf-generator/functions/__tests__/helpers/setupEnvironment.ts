const path = require("path");

export const pathToenvFile = path.resolve(
  __dirname,
  "../../../extensions/pdf-generator.env.local"
);

export const setupEnvironment = () => {
  console.log(pathToenvFile);
  require("dotenv").config({
    path: pathToenvFile,
  });
};
