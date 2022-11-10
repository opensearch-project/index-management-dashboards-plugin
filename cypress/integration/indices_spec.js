/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from "../support/constants";
import samplePolicy from "../fixtures/sample_policy";

const POLICY_ID = "test_policy_id";
const SAMPLE_INDEX = "sample_index";
const REINDEX_DEST = "index-reindex-01";

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
      cy.get('[data-test-subj="More Action"]').click();
      cy.get(`[data-test-subj="Apply policyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).click().type(POLICY_ID);

      // Click the policy option
      cy.get(`button[role="option"]`).first().click({ force: true });

      cy.contains("A simple description");

      cy.get(`[data-test-subj="applyPolicyModalEditButton"]`).click({ force: true });

      // Wait some time for apply policy to execute before reload
      cy.wait(3000).reload();

      cy.contains(SAMPLE_INDEX, { timeout: 20000 });

      // Confirm our index is now being managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("Yes");

      // Confirm the information shows in detail modal
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`).click();
      cy.get(`[data-test-subj="index-detail-overview-item-Managed by policy"] .euiDescriptionList__description a`).contains(POLICY_ID);
    });
  });

  describe("can make indices deleted", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Click actions button
      cy.get('[data-test-subj="More Action"]').click();

      // Delete btn should be disabled if no items selected
      cy.get('[data-test-subj="Delete Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // click any where to hide actions
      cy.get("#_selection_column_sample_index-checkbox").click();
      cy.get('[data-test-subj="Delete Action"]').should("not.exist");

      // Click actions button
      cy.get('[data-test-subj="More Action"]').click();
      // Delete btn should be enabled
      cy.get('[data-test-subj="Delete Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();
      // The confirm button should be disabled
      cy.get('[data-test-subj="Delete Confirm button"]').should("have.class", "euiButton-isDisabled");
      // type delete
      cy.get('[placeholder="delete"]').type("delete");
      cy.get('[data-test-subj="Delete Confirm button"]').should("not.have.class", "euiContextMenuItem-isDisabled");
      // click to delete
      cy.get('[data-test-subj="Delete Confirm button"]').click();
      // the sample_index should not exist
      cy.wait(500);
      cy.get("#_selection_column_sample_index-checkbox").should("not.exist");
    });
  });

  describe("shows detail of a index when click the item", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`).click();
      cy.get(`[data-test-subj="index-detail-overview-item-Index name"] .euiDescriptionList__description > span`).should(
        "have.text",
        SAMPLE_INDEX
      );
    });
  });

  describe("can search with reindex & recovery status", () => {
    const reindexedIndex = "reindex_opensearch_dashboards_sample_data_ecommerce";
    const splittedIndex = "split_opensearch_dashboards_sample_data_logs";
    before(() => {
      cy.deleteAllIndices();
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/indices`);

      // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
      cy.contains("Rows per page", { timeout: 60000 });

      cy.request({
        method: "POST",
        url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/ecommerce`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.request({
        method: "POST",
        url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/logs`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.request({
        method: "DELETE",
        url: `${Cypress.env("opensearch")}/${reindexedIndex}`,
        failOnStatusCode: false,
      });
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("opensearch")}/${splittedIndex}`,
        failOnStatusCode: false,
      });
    });

    after(() => {
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("opensearch")}/${reindexedIndex}`,
        failOnStatusCode: false,
      });
      cy.request({
        method: "DELETE",
        url: `${Cypress.env("opensearch")}/${splittedIndex}`,
        failOnStatusCode: false,
      });
    });

    it("Successfully", () => {
      cy.request({
        method: "PUT",
        url: `${Cypress.env("opensearch")}/${reindexedIndex}`,
        body: {
          settings: {
            index: {
              number_of_shards: 1,
              number_of_replicas: "0",
            },
          },
        },
      });
      // do a simple reindex
      cy.request("POST", `${Cypress.env("opensearch")}/_reindex?wait_for_completion=false`, {
        source: {
          index: "opensearch_dashboards_sample_data_ecommerce",
        },
        dest: {
          index: reindexedIndex,
        },
      });

      cy.get('[placeholder="Search"]').type("o");

      // do a simple split
      cy.request("PUT", `${Cypress.env("opensearch")}/opensearch_dashboards_sample_data_logs/_settings`, {
        "index.blocks.write": true,
      });

      cy.window().then((window) => {
        return Promise.race([
          new Promise((resolve) => setTimeout(resolve, 2000)),
          window.fetch(`/api/ism/apiCaller`, {
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              endpoint: "indices.split",
              data: {
                index: "opensearch_dashboards_sample_data_logs",
                target: splittedIndex,
                body: {
                  settings: {
                    index: {
                      number_of_shards: 2,
                    },
                  },
                },
              },
            }),
            method: "PUT",
          }),
        ]);
      });

      cy.get('[placeholder="Search"]').type("p");
    });
  });

  describe("can shrink an index", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createIndex(SAMPLE_INDEX, null, {
        settings: { "index.blocks.write": true, "index.number_of_shards": 2, "index.number_of_replicas": 0 },
      });
    });

    it("successfully shrink an index", () => {
      // Type in SAMPLE_INDEX in search input
      cy.get(`input[type="search"]`).focus().type(SAMPLE_INDEX);

      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      cy.get('[data-test-subj="More Action"]').click();
      // Shrink btn should be disabled if no items selected
      cy.get('[data-test-subj="Shrink Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      cy.get('[data-test-subj="More Action"]').click();
      // Shrink btn should be enabled
      cy.get('[data-test-subj="Shrink Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for Shrink index flyout
      cy.contains("Shrink index");

      // Enter target index name
      cy.get(`input[data-test-subj="targetIndexNameInput"]`).type(`${SAMPLE_INDEX}_shrunken`);

      // Click shrink index button
      cy.get("button").contains("Shrink index").click({ force: true });

      // Check for success toast
      cy.contains("Shrink index successfully");
    });
  });

  describe("can close and open an index", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully close an index", () => {
      cy.contains(SAMPLE_INDEX);

      cy.get('[data-test-subj="More Action"]').click();
      // Close btn should be disabled if no items selected
      cy.get('[data-test-subj="Close Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      cy.get('[data-test-subj="More Action"]').click();
      // Close btn should be enabled
      cy.get('[data-test-subj="Close Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for close index modal
      cy.contains("Close indices");

      // Close confirm button should be disabled
      cy.get('[data-test-subj="Close Confirm button"]').should("have.class", "euiButton-isDisabled");
      // type close
      cy.get('[placeholder="close"]').type("close");
      cy.get('[data-test-subj="Close Confirm button"]').should("not.have.class", "euiContextMenuItem-isDisabled");

      // Click close confirm button
      cy.get('[data-test-subj="Close Confirm button"]').click();

      // Check for success toast
      cy.contains("Close index successfully");

      // Confirm the index is closed
      cy.get(`input[type="search"]`).focus().type(SAMPLE_INDEX);
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("close");
      });
    });

    it("successfully open an index", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      cy.get('[data-test-subj="More Action"]').click();
      // Open btn should be disabled if no items selected
      cy.get('[data-test-subj="Open Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({ force: true });

      cy.get('[data-test-subj="More Action"]').click();
      // Open btn should be enabled
      cy.get('[data-test-subj="Open Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for open index modal
      cy.contains("Open indices");

      cy.get('[data-test-subj="Open Confirm button"]').click();

      // Check for success toast
      cy.contains("Open index successfully");

      // Confirm the index is open
      cy.get(`input[type="search"]`).focus().type(SAMPLE_INDEX);
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("open");
      });
    });
  });

  describe("can perform reindex", () => {
    before(() => {
      cy.deleteAllIndices();
      // Load ecommerce data
      cy.request({
        method: "POST",
        url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/ecommerce`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Click actions button
      cy.get('[data-test-subj="More Action"]').click();

      // Delete btn should be disabled if no items selected
      cy.get('[data-test-subj="Reindex Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // click any where to hide actions
      cy.get("#_selection_column_opensearch_dashboards_sample_data_ecommerce-checkbox").click();
      cy.get('[data-test-subj="Reindex Action"]').should("not.exist");

      // Click actions button
      cy.get('[data-test-subj="More Action"]').click();
      // Delete btn should be enabled
      cy.get('[data-test-subj="Reindex Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // source index populated
      cy.get('[data-test-subj="sourceIndicesComboInput"] .euiBadge__text').contains("opensearch_dashboards_sample_data_ecommerce");

      cy.get(`div[data-test-subj="destIndicesComboInput"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .type(`${REINDEX_DEST}{enter}`);

      // dest index settings show up
      cy.get('div[data-test-subj="destSettingJsonEditor"]').should("exist");

      // input query to reindex subset
      cy.get('[data-test-subj="queryJsonEditor"] textarea')
        .focus()
        .clear()
        .type('{"query":{"match":{"category":"Men\'s Clothing"}}}', { parseSpecialCharSequences: false });

      // click to perform reindex
      cy.get('[data-test-subj="flyout-footer-action-button"]').click();
      cy.wait(20);
      cy.contains(/Reindex .* success .* taskId .*/);

      // Type in REINDEX_DEST in search input
      cy.get(`input[type="search"]`).focus().type(REINDEX_DEST);

      // Confirm we only see REINDEX_DEST in table
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain(REINDEX_DEST);
      });
    });
  });
});
