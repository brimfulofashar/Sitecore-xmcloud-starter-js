import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat configs; wrapping them in FlatCompat
// fails with "Converting circular structure to JSON".

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { 
    rules: {
      // Don't force alt for <Image/> (sourced from Sitecore media)
      "jsx-a11y/alt-text": "off",
      "no-console": ["warn", { allow: ["error"] }],
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;