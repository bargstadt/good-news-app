// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    ignores: ["node_modules/**", "dist/**", "build/**"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    ...js.configs.recommended,
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
