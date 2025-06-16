import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import jsdocPlugin from "eslint-plugin-jsdoc";

// Globals nécessaires pour Jest
const jestGlobals = {
  describe: "readonly",
  it: "readonly",
  test: "readonly",
  expect: "readonly",
  beforeAll: "readonly",
  afterAll: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
  jest: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier: prettierPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      camelcase: ["error", { properties: "always" }],
      "prettier/prettier": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "error",
    },
  },
  // Bloc spécial pour les fichiers de test
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__mocks__/**/*.ts",
      "**/tests/**/*.ts",
      "**/tests/**/*.tsx",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        ...jestGlobals,
        process: "readonly",
      },
    },
  },
];
