module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier",
    "google",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json", "__tests__/tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: ["**/*js"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "import/no-unresolved": 0,
  },
};
