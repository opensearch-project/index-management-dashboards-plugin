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

import { PLUGIN_NAME } from "../support/constants";
import samplePolicy from "../fixtures/sample_policy";

const POLICY_ID = "test_policy_id";
const SAMPLE_INDEX = "sample_index";

describe("Indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM OSD
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/indices`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched", () => {
    before(() => {
      cy.deleteAllIndices();
      // Create 20+ indices that can be sorted alphabetically by using letters a-z
      for (let i = 97; i < 123; i++) {
        const char = String.fromCharCode(i);
        cy.createIndex(`index_${char}`);
      }
    });

    it("successfully", () => {
      // Get the index table header and click it to sort
      cy.get("thead > tr > th").contains("Index").click({ force: true });

      // Confirm we have index_a in view and not index_z
      cy.contains("index_a");
      cy.contains("index_z").should("not.exist");

      // Type in index_z in search input
      cy.get(`input[type="search"]`).focus().type("index_z");

      // Confirm we only see index_z in table
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("index_z");
      });
    });
  });

  describe("can show data stream indices", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteDataStreams("*");

      cy.createIndexTemplate("logs-template", {
        index_patterns: ["logs-*"],
        data_stream: {},
      });

      // Create sample regular indices.
      cy.createIndex("index-1");
      cy.createIndex("index-2");

      // Create sample data streams.
      cy.createDataStream("logs-nginx");
      cy.createDataStream("logs-haproxy");
      cy.createDataStream("logs-redis");
      cy.rollover("logs-redis");
    });

    it("successfully", () => {
      // Confirm that the regular indices are shown.
      cy.contains("index-1");
      cy.contains("index-2");

      // Confirm that the data stream indices are not shown by default.
      cy.contains(".ds-logs-nginx-000001").should("not.exist");
      cy.contains(".ds-logs-haproxy-000001").should("not.exist");

      // Confirm that "Show data stream indices" toggle switch works.
      cy.get(`[data-test-subj="toggleShowDataStreams"]`).click({ force: true });
      cy.contains(".ds-logs-nginx-000001");
      cy.contains(".ds-logs-haproxy-000001");

      // Confirm that data stream indices can be searched.
      cy.get(`input[type="search"]`).focus().type("logs-redis");
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "2 rows").to.have.length(2);
        expect($tr, "item").to.contain(".ds-logs-redis-000001");
        expect($tr, "item").to.contain(".ds-logs-redis-000002");
      });
      cy.get(`button[aria-label="Clear input"]`).first().click({ force: true });

      // Confirm that data streams can be selected from dropdown.
      cy.get(`span[data-text="Data streams"]`).first().click({ force: true });
      cy.get(".euiFilterSelect__items").should(($tr) => {
        expect($tr, "item").to.contain("logs-nginx");
        expect($tr, "item").to.contain("logs-haproxy");
        expect($tr, "item").to.contain("logs-redis");
      });

      // Select data streams from the list.
      cy.get(".euiFilterSelect__items").contains("logs-nginx").click({ force: true });
      cy.get(".euiFilterSelect__items").contains("logs-haproxy").click({ force: true });
      cy.get(`span[data-text="Data streams"]`).first().click({ force: true });
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "2 rows").to.have.length(2);
        expect($tr, "item").to.contain(".ds-logs-nginx-000001");
        expect($tr, "item").to.contain(".ds-logs-haproxy-000001");
      });
    });
  });

  describe("can have policies applied", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Confirm our initial index is not currently managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("No");

      // Select checkbox for our index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      // Click apply policy button
      cy.get(`[data-test-subj="Apply policyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).focus().type(POLICY_ID, {
        parseSpecialCharSequences: false,
        delay: 1,
      });

      // Click the policy option
      cy.get(`button[role="option"]`).first().click({ force: true });

      cy.contains("A simple description");

      cy.get(`[data-test-subj="applyPolicyModalEditButton"]`).click({ force: true });

      cy.wait(3000).reload();

      cy.contains(SAMPLE_INDEX, { timeout: 20000 });

      // Confirm our index is now being managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("Yes");
    });
  });
});
