/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
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
