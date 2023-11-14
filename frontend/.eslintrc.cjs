module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [["@src", "./src"]],
        extensions: [".ts", ".js", ".jsx", ".tsx", ".json"],
      },
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:jest-dom/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ["react-refresh", "jsx-a11y", "jest-dom"],
  rules: {
    "@typescript-eslint/init-declarations": "error",

    eqeqeq: "error",
    "func-style": ["error", "declaration"],
    "object-shorthand": "error",
    "prefer-template": "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: ["../*"],
      },
    ],

    // turn this off to allow the use of useEffect on mount
    "react-hooks/exhaustive-deps": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ["*.test.ts{,x}"],
      rules: {
        "@typescript-eslint/no-empty-function": "off",
      },
    },
  ],
};
