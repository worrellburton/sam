import js from "@eslint/js";
import tseslint from "typescript-eslint";

// NOTE: eslint-config-next is intentionally NOT wired in here — its
// bundled eslint-plugin-react is incompatible with ESLint v10 (crashes
// with "contextOrFilename.getFilename is not a function"). Until that
// compatibility lands, the Next.js lint rules (@next/next/*, react-hooks/*)
// are not registered, so don't add inline `eslint-disable` directives that
// reference them — they'll error as "rule not found".

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [".next/", "node_modules/", "build/", "public/"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
