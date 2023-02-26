import * as path from "path";
import dotenv from "dotenv";

export const pathToEnvFile = path.resolve(
  __dirname,
  "../../../extensions/firestore-pdf-generator.env.test"
);

export const setupEnvironment = () => {
  dotenv.config({
    path: pathToEnvFile,
  });
};
