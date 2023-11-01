/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@typescript-eslint/strict-type-checked",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./test/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
  ignorePatterns: ["build", "coverage", "node_modules"],
  rules: {
    "@typescript-eslint/init-declarations": "error",

    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],

    eqeqeq: "error",
    "func-style": ["error", "declaration"],
    "object-shorthand": "error",
    "prefer-template": "error",
  },
};
