/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH, IM_PLUGIN_NAME, BACKEND_BASE_PATH } from "../../../utils/constants";
import samplePolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_policy";

const POLICY_ID = "test_policy_id";
const SAMPLE_INDEX = "sample_index";

describe("Indices", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.deleteIMJobs();
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
      cy.deleteIMJobs();
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
      cy.get('[data-test-subj="tablePaginationPopoverButton"]').click();
      cy.get(".euiContextMenuItem__text").contains("50 rows").click();

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
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Confirm our initial index is not currently managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("No");

      // Select checkbox for our index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      // Click apply policy button
      cy.get('[data-test-subj="moreAction"]').click();
      cy.get(`[data-test-subj="Apply policyButton"]`).click({ force: true });

      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).click().type(POLICY_ID);

      // Click the policy option
      cy.get(`button[role="option"]`).first().click({ force: true });

      cy.contains("A simple description");

      cy.get(`[data-test-subj="applyPolicyModalEditButton"]`).click({
        force: true,
      });

      // Wait some time for apply policy to execute before reload
      cy.wait(3000).reload();

      cy.contains(SAMPLE_INDEX, { timeout: 20000 });

      // Confirm our index is now being managed
      cy.get(`tbody > tr:contains("${SAMPLE_INDEX}") > td`).filter(`:nth-child(4)`).contains("Yes");

      // Confirm the information shows in detail modal
      cy.get(`[data-test-subj="viewIndexDetailButton-${SAMPLE_INDEX}"]`).click();
      cy.get(`[data-test-subj="indexDetailOverviewItem-Managed by policy"] .euiDescriptionList__description a`).contains(POLICY_ID);
    });
  });

  describe("can make indices deleted", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      // Click actions button
      cy.get('[data-test-subj="moreAction"]').click();

      // Delete btn should be disabled if no items selected
      cy.get('[data-test-subj="deleteAction"]').should("have.class", "euiContextMenuItem-isDisabled");

      // click any where to hide actions
      cy.get("#_selection_column_sample_index-checkbox").click();
      cy.get('[data-test-subj="deleteAction"]').should("not.exist");

      // Click actions button
      cy.get('[data-test-subj="moreAction"]').click();
      // Delete btn should be enabled
      cy.get('[data-test-subj="deleteAction"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();
      // The confirm button should be disabled
      cy.get('[data-test-subj="Delete Confirm button"]').should("have.class", "euiButton-isDisabled");
      cy.wait(1000);
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
      cy.deleteIMJobs();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully", () => {
      cy.get(`[data-test-subj="viewIndexDetailButton-${SAMPLE_INDEX}"]`).click();
      cy.get(`[data-test-subj="indexDetailOverviewItem-Index name"] .euiDescriptionList__description > span`).should(
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
      cy.deleteIMJobs();
      // Visit ISM OSD
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`);

      // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
      cy.contains("Rows per page", { timeout: 60000 });

      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/sample_data/ecommerce`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/sample_data/logs`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.request({
        method: "PUT",
        url: `${BACKEND_BASE_PATH}/${splittedIndex}/_settings`,
        body: {
          "index.blocks.read_only": false,
        },
        failOnStatusCode: false,
      });
      cy.request({
        method: "DELETE",
        url: `${BACKEND_BASE_PATH}/${reindexedIndex}`,
        failOnStatusCode: false,
      });
      cy.request({
        method: "DELETE",
        url: `${BACKEND_BASE_PATH}/${splittedIndex}`,
        failOnStatusCode: false,
      });
    });

    it("Successfully", () => {
      cy.request({
        method: "PUT",
        url: `${BACKEND_BASE_PATH}/${reindexedIndex}`,
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
      cy.request("POST", `${BACKEND_BASE_PATH}/_reindex?wait_for_completion=false`, {
        source: {
          index: "opensearch_dashboards_sample_data_ecommerce",
        },
        dest: {
          index: reindexedIndex,
        },
      });

      cy.get('[placeholder="Search"]').type("o");

      // do a simple split
      cy.request("PUT", `${BACKEND_BASE_PATH}/opensearch_dashboards_sample_data_logs/_settings`, {
        "index.blocks.write": true,
      });

      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/ism/apiCaller`,
        headers: {
          "osd-xsrf": true,
        },
        body: {
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
        },
      });

      cy.get('[placeholder="Search"]').type("p");
    });

    after(() => {
      cy.request({
        method: "DELETE",
        url: `${BACKEND_BASE_PATH}/${reindexedIndex}`,
        failOnStatusCode: false,
      });
      cy.request({
        method: "DELETE",
        url: `${BACKEND_BASE_PATH}/${splittedIndex}`,
        failOnStatusCode: false,
      });
    });
  });

  describe("can shrink an index", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createIndex(SAMPLE_INDEX, null, {
        settings: {
          "index.blocks.write": true,
          "index.number_of_shards": 2,
          "index.number_of_replicas": 0,
        },
      });
    });

    it("successfully shrink an index", () => {
      // Type in SAMPLE_INDEX in search input
      cy.get(`input[type="search"]`).focus().type(SAMPLE_INDEX);

      cy.wait(1000).get(".euiTableRow").should("have.length", 1);
      // Confirm we have our initial index
      cy.contains(SAMPLE_INDEX);

      cy.get('[data-test-subj="moreAction"]').click();
      // Shrink btn should be disabled if no items selected
      cy.get('[data-test-subj="Shrink Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      cy.get('[data-test-subj="moreAction"]').click();
      // Shrink btn should be enabled
      cy.get('[data-test-subj="Shrink Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for Shrink page
      cy.contains("Shrink index");

      // Enter target index name
      cy.get(`input[data-test-subj="targetIndexNameInput"]`).type(`${SAMPLE_INDEX}_shrunken`);

      // Click shrink index button
      cy.get("button").contains("Shrink").click({ force: true });

      // Check for success toast
      cy.contains(`Successfully started shrinking ${SAMPLE_INDEX}. The shrunken index will be named ${SAMPLE_INDEX}_shrunken.`);
    });
  });

  describe("can close and open an index", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createIndex(SAMPLE_INDEX);
    });

    it("successfully close an index", () => {
      cy.contains(SAMPLE_INDEX);

      cy.get('[data-test-subj="moreAction"]').click();
      // Close btn should be disabled if no items selected
      cy.get('[data-test-subj="Close Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      cy.get('[data-test-subj="moreAction"]').click();
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
      cy.contains("Close [sample_index] successfully");

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

      cy.get('[data-test-subj="moreAction"]').click();
      // Open btn should be disabled if no items selected
      cy.get('[data-test-subj="Open Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      cy.get('[data-test-subj="moreAction"]').click();
      // Open btn should be enabled
      cy.get('[data-test-subj="Open Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for open index modal
      cy.contains("Open indices");

      cy.get('[data-test-subj="Open Confirm button"]').click();

      // Check for success toast
      cy.contains("Open [sample_index] successfully");

      // Confirm the index is open
      cy.get(`input[type="search"]`).focus().type(SAMPLE_INDEX);
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain("open");
      });
    });
  });

  describe("can clear caches for indexes", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      for (let i = 100; i < 105; i++) {
        const char = String.fromCharCode(i);
        cy.createIndex(`index_${char}`);
      }
    });

    it("successfully clear caches for multiple indexes", () => {
      // Select multiple indexes
      cy.get(`[data-test-subj="checkboxSelectRow-index_d"]`).check({
        force: true,
      });
      cy.get(`[data-test-subj="checkboxSelectRow-index_e"]`).check({
        force: true,
      });

      cy.get('[data-test-subj="moreAction"]').click();
      // Clear cache btn should be enabled
      cy.get('[data-test-subj="Clear cache Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for clear cache index modal
      cy.contains("Clear cache");

      // Click clear cache confirm button
      cy.get('[data-test-subj="ClearCacheConfirmButton"]').click();

      // Check for success toast
      cy.contains("Clear caches for [index_d,index_e] successfully");
    });

    it("successfully clear caches for all indexes", () => {
      cy.get('[data-test-subj="moreAction"]').click();

      // Clear cache btn should be enabled
      cy.get('[data-test-subj="Clear cache Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for clear cache index modal
      cy.contains("Clear cache");

      // Click clear cache confirm button
      cy.get('[data-test-subj="ClearCacheConfirmButton"]').click();

      // Check for success toast
      cy.contains("Clear caches for all indexes successfully");
    });
  });
});
