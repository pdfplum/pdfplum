const packageJson = require("./package.json");

module.exports = {
  displayName: packageJson.name,
  rootDir: "./",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/__tests__/tsconfig.json",
    },
  },
  setupFiles: ["<rootDir>/__tests__/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/functions.test.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: [".*/bin/", ".*/lib/"],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/test-data/**",
  ],
};
