import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // eslint-config-next 16 ships native flat configs; wrapping them in FlatCompat
  // fails with "Converting circular structure to JSON".
  ...nextCoreWebVitals,
  ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier/recommended"
  ),
  {
    plugins: {},
    rules: {
      // Don't force next/image
      "@next/next/no-img-element": "off",
      // Don't force alt for <Image/> (sourced from Sitecore media)
      "jsx-a11y/alt-text": ["warn", { elements: ["img"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrorsIgnorePattern: ".",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "jsx-quotes": ["error", "prefer-double"],
    },
    ignores: [
      ".generated/**/*",
      "**/*.d.ts",
      "**/*.js",
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
    ],
  },
];

export default eslintConfig;
