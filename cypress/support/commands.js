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

const { API, INDEX, ADMIN_AUTH } = require("./constants");

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
  // Add the basic auth header when security enabled in the Opensearch cluster
  // https://github.com/cypress-io/cypress/issues/1288
  if (Cypress.env("security_enabled")) {
    const ADMIN_AUTH = {
      username: Cypress.env("username"),
      password: Cypress.env("password"),
    };
    if (options) {
      options.auth = ADMIN_AUTH;
    } else {
      options = { auth: ADMIN_AUTH };
    }
    // Add query parameters - select the default OSD tenant
    options.qs = { security_tenant: "private" };
    return originalFn(url, options);
  } else {
    return originalFn(url, options);
  }
});

// Be able to add default options to cy.request(), https://github.com/cypress-io/cypress/issues/726
Cypress.Commands.overwrite("request", (originalFn, ...args) => {
  let defaults = {};
  // Add the basic authentication header when security enabled in the Opensearch cluster
  const ADMIN_AUTH = {
    username: Cypress.env("username"),
    password: Cypress.env("password"),
  };
  if (Cypress.env("security_enabled")) {
    defaults.auth = ADMIN_AUTH;
  }

  let options = {};
  if (typeof args[0] === "object" && args[0] !== null) {
    options = Object.assign({}, args[0]);
  } else if (args.length === 1) {
    [options.url] = args;
  } else if (args.length === 2) {
    [options.method, options.url] = args;
  } else if (args.length === 3) {
    [options.method, options.url, options.body] = args;
  }

  return originalFn(Object.assign({}, defaults, options));
});

Cypress.Commands.add("deleteAllIndices", () => {
  cy.request("DELETE", `${Cypress.env("opensearch")}/index*,sample*,opensearch_dashboards*`);
  cy.request("DELETE", `${Cypress.env("opensearch")}/.opendistro-ism*?expand_wildcards=all`);
});

Cypress.Commands.add("createPolicy", (policyId, policyJSON) => {
  cy.request("PUT", `${Cypress.env("opensearch")}${API.POLICY_BASE}/${policyId}`, policyJSON);
});

Cypress.Commands.add("getIndexSettings", (index) => {
  cy.request("GET", `${Cypress.env("opensearch")}/${index}/_settings`);
});

Cypress.Commands.add("updateManagedIndexConfigStartTime", (index) => {
  // Creating closure over startTime so it's not calculated until actual update_by_query call
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000).then(() => {
    const FIVE_MINUTES_MILLIS = 5 * 60 * 1000; // Default ISM job interval
    const THREE_SECONDS_MILLIS = 3000; // Subtract 3 seconds to account for buffer of updating doc, descheduling, rescheduling
    const startTime = new Date().getTime() - (FIVE_MINUTES_MILLIS - THREE_SECONDS_MILLIS);
    const body = {
      query: { term: { "managed_index.index": index } },
      script: {
        lang: "painless",
        source: `ctx._source['managed_index']['schedule']['interval']['start_time'] = ${startTime}L`,
      },
    };
    cy.request("POST", `${Cypress.env("opensearch")}/${INDEX.OPENDISTRO_ISM_CONFIG}/_update_by_query`, body);
  });
});

Cypress.Commands.add("createIndex", (index, policyID = null, settings = {}) => {
  cy.request("PUT", `${Cypress.env("opensearch")}/${index}`, settings);
  if (policyID != null) {
    const body = { policy_id: policyID };
    cy.request("POST", `${Cypress.env("opensearch")}${API.ADD_POLICY_BASE}/${index}`, body);
  }
});

Cypress.Commands.add("createRollup", (rollupId, rollupJSON) => {
  cy.request("PUT", `${Cypress.env("opensearch")}${API.ROLLUP_JOBS_BASE}/${rollupId}`, rollupJSON);
});

Cypress.Commands.add("createIndexTemplate", (name, template) => {
  cy.request("PUT", `${Cypress.env("opensearch")}${API.INDEX_TEMPLATE_BASE}/${name}`, template);
});

Cypress.Commands.add("createDataStream", (name) => {
  cy.request("PUT", `${Cypress.env("opensearch")}${API.DATA_STREAM_BASE}/${name}`);
});

Cypress.Commands.add("deleteDataStreams", (names) => {
  cy.request("DELETE", `${Cypress.env("opensearch")}${API.DATA_STREAM_BASE}/${names}`);
});

Cypress.Commands.add("rollover", (target) => {
  cy.request("POST", `${Cypress.env("opensearch")}/${target}/_rollover`);
});
