/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: "../",
  setupFiles: ["<rootDir>/test/polyfills.ts", "<rootDir>/test/setupTests.ts"],
  setupFilesAfterEnv: ["jest-location-mock", "<rootDir>/test/setup.jest.ts", "<rootDir>../../src/dev/jest/setup/monaco_mock.js"],
  roots: ["<rootDir>"],
  coverageDirectory: "./coverage",
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/test/mocks/styleMock.ts",
    "^ui/(.*)": "<rootDir>/../../src/legacy/ui/public/$1/",
  },
  coverageReporters: ["lcov", "text", "cobertura"],
  testMatch: ["**/*.test.js", "**/*.test.jsx", "**/*.test.ts", "**/*.test.tsx"],
  collectCoverageFrom: [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "!**/models/**",
    "!**/node_modules/**",
    "!**/index.ts",
    "!<rootDir>/index.js",
    "!<rootDir>/public/app.js",
    "!<rootDir>/public/temporary/**",
    "!<rootDir>/babel.config.js",
    "!<rootDir>/test/**",
    "!<rootDir>/server/**",
    "!<rootDir>/coverage/**",
    "!<rootDir>/scripts/**",
    "!<rootDir>/build/**",
    "!<rootDir>/cypress/**",
    "!**/vendor/**",
    "!**/index.d.ts",
    "!**/lib/field/**",
    // There is a compile error in monaco-editor, ignore related components
    "!**/components/JSONDiffEditor/**",
  ],
  clearMocks: true,
  transformIgnorePatterns: [
    // ignore all node_modules except those which are published as ESM-only and
    // therefore need babel transforms to be usable under Jest.
    "[/\\\\]node_modules(?![\\/\\\\](query-string|decode-uri-component|filter-obj|split-on-first))[/\\\\].+\\.js$",
  ],
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  modulePathIgnorePatterns: ["indexManagementDashboards"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    // Set the default URL so window.location.origin is 'http://localhost:5601' rather than
    // 'http://localhost', avoiding the need for tests to mock window.location.origin.
    url: "http://localhost:5601",
  },
  // Retain Jest 28 snapshot defaults; Jest 29 flipped escapeString and printBasicPrototype to false,
  // which would invalidate existing snapshots. See https://jestjs.io/docs/upgrading-to-jest29
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
