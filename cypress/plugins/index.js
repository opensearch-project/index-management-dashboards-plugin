/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// TODO: yarn osd bootstrap fails when trying to add below package as a dependency..
// const wp = require("@cypress/webpack-preprocessor");
//
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on) => {
  //   const options = {
  //     webpackOptions: {
  //       resolve: {
  //         extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  //       },
  //       module: {
  //         rules: [
  //           {
  //             test: /\.tsx?$/,
  //             loader: "ts-loader",
  //             options: { transpileOnly: true },
  //           },
  //         ],
  //       },
  //     },
  //   };
  //
  //   on("file:preprocessor", wp(options));
};
