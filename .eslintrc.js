/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const LICENSE_HEADER = `
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

module.exports = {
  root: true,
  extends: ["@elastic/eslint-config-kibana", "plugin:@elastic/eui/recommended"],
  rules: {
    // "@osd/eslint/require-license-header": "off"
    "import/no-default-export": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase", "UPPER_CASE", "PascalCase", "snake_case"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],
    "@osd/eslint/no-restricted-paths": [
      "error",
      {
        basePath: __dirname,
        zones: [
          {
            target: ["(public|server)/**/*"],
            from: ["../../packages/**/*", "packages/**/*"],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.{js,ts,tsx}"],
      rules: {
        "@osd/eslint/require-license-header": [
          "error",
          {
            licenses: [LICENSE_HEADER],
          },
        ],
        "no-console": 0,
      },
    },
  ],
};
