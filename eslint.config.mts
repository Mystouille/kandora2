import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Allow any types for API integrations and protobuf
      "@typescript-eslint/no-explicit-any": "off",
      // Allow empty interfaces for protobuf types
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow unused vars for generated types and dev code
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow require imports for specific cases
      "@typescript-eslint/no-require-imports": "warn",
      // Allow unused expressions for protobuf setup
      "@typescript-eslint/no-unused-expressions": "warn",
      // Prefer const but don't error
      "prefer-const": "warn",
      // Allow useless escapes in regex/templates
      "no-useless-escape": "warn",
      // Allow var in legacy code
      "no-var": "warn",
    },
  },
];
