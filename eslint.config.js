/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const osdConfig = require("@elastic/eslint-config-kibana");
const { eui } = require("@elastic/eslint-config-kibana/extras");

const LICENSE_HEADER = `
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
`;

module.exports = [
  ...osdConfig,
  ...eui,
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      "@osd/eslint/require-license-header": ["error", { licenses: [LICENSE_HEADER] }],
      "no-console": 0,
    },
  },
];
