import * as path from "path";
import dotenv from "dotenv";

export const pathToEnvFile = path.resolve(
  __dirname,
  "../../../extensions/pdf-generator.env.test"
);

export const setupEnvironment = () => {
  dotenv.config({
    path: pathToEnvFile,
  });
};
