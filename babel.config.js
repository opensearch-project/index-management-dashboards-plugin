/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// babelrc doesn't respect NODE_PATH anymore but using require does.
// Alternative to install them locally in node_modules
module.exports = function (api) {
  const isTest = api.env("test");

  // Common plugins for all environments
  const commonPlugins = [require("@babel/plugin-proposal-nullish-coalescing-operator")];

  // Test-specific configuration
  if (isTest) {
    return {
      presets: [require("@babel/preset-env"), require("@babel/preset-react"), require("@babel/preset-typescript")],
      plugins: [
        [require("@babel/plugin-transform-runtime"), { regenerator: true }],
        require("@babel/plugin-transform-class-properties"),
        require("@babel/plugin-transform-object-rest-spread"),
        [require("@babel/plugin-transform-modules-commonjs"), { allowTopLevelThis: true }],
        ...commonPlugins,
      ],
    };
  }

  // Build/dev configuration
  return {
    plugins: commonPlugins,
  };
};
