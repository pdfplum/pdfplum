module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier",
    "google",
    "plugin:prettier/recommended",
  ],
  plugins: ["import"],
  rules: {
    "import/no-unresolved": 0,
  },
};
