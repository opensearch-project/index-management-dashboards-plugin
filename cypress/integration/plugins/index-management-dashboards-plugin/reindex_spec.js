/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";
const REINDEX_DEST = "test-ecomm-rdx";
const REINDEX_DEST_NO_SOURCE = "test-reindex-nosource";
const REINDEX_NEW_CREATED = "test-logs-new";

describe("Reindex", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("Reindex validation error", () => {
    before(() => {
      cy.deleteAllIndices();
      // Load ecommerce data
      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/sample_data/ecommerce`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.createIndex(REINDEX_DEST_NO_SOURCE, null, {
        mappings: {
          _source: {
            enabled: false,
          },
          properties: {
            name: {
              type: "keyword",
            },
          },
        },
      });
    });

    it("source validation failed", () => {
      // Confirm we have our initial index
      cy.contains(REINDEX_DEST_NO_SOURCE);

      cy.get(`[data-test-subj="checkboxSelectRow-${REINDEX_DEST_NO_SOURCE}"]`).check({ force: true });

      // Click actions button
      cy.get('[data-test-subj="moreAction"]').click();
      // Reindex should show as activate
      cy.get('[data-test-subj="Reindex Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      cy.contains(/_sources is not enabled/);
    });
  });

  describe("Reindex successfully", () => {
    before(() => {
      cy.deleteAllIndices();
      // Load ecommerce data
      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/sample_data/ecommerce`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });

      cy.createIndex(REINDEX_DEST, null, {
        settings: { "index.number_of_replicas": 0 },
      });

      cy.createPipeline("bumpOrderId", {
        description: "sample description",
        processors: [
          {
            set: {
              field: "order_id",
              value: "200{{order_id}}",
            },
          },
        ],
      });
    });

    it("successfully", () => {
      // Confirm we have our initial index
      cy.contains("opensearch_dashboards_sample_data_ecommerce");

      // Click actions button
      cy.get('[data-test-subj="moreAction"]').click();
      // Reindex should show as activate
      cy.get('[data-test-subj="Reindex Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      cy.get(`div[data-test-subj="sourceSelector"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .type(`opensearch_dashboards_sample_data_ecommerce{downArrow}{enter}`);

      cy.get(`div[data-test-subj="destinationSelector"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .type(`${REINDEX_DEST}{downArrow}{enter}`);

      // open advance option
      cy.get('[data-test-subj="advanceOptionToggle"]').click();

      // enable subset query
      cy.get('[data-test-subj="subsetOption"] #subset').click({ force: true });

      // input query to reindex subset
      cy.get('[data-test-subj="queryJsonEditor"] textarea').focus().clear().type('{"query":{"match":{"category":"Men\'s Clothing"}}}', {
        parseSpecialCharSequences: false,
      });

      // set slices to auto
      cy.get('[data-test-subj="sliceEnabled"]').click({ force: true });

      // input pipeline
      cy.get(`div[data-test-subj="pipelineCombobox"]`).find(`input[data-test-subj="comboBoxSearchInput"]`).type("bumpOrderId{enter}");

      // click to perform reindex
      cy.get('[data-test-subj="reindexConfirmButton"]').click();
      cy.wait(10);
      cy.contains(/Successfully started reindexing/);

      cy.wait(10000);
      // Type in REINDEX_DEST in search input
      cy.get(`input[type="search"]`).focus().type(REINDEX_DEST);

      // Confirm we only see REINDEX_DEST in table
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain(REINDEX_DEST);
      });
    });
  });

  describe("Reindex successfully for newly created index", () => {
    before(() => {
      cy.deleteAllIndices();
      // Load logs data
      cy.request({
        method: "POST",
        url: `${BASE_PATH}/api/sample_data/logs`,
        headers: {
          "osd-xsrf": true,
        },
      }).then((response) => {
        expect(response.status).equal(200);
      });
    });

    it("successfully", () => {
      // search
      cy.get(`input[type="search"]`).focus().type("opensearch_dashboards_sample_data_logs");

      cy.wait(1000);

      // Confirm we have our initial index
      cy.contains("opensearch_dashboards_sample_data_logs");

      // select logs index
      cy.get("#_selection_column_opensearch_dashboards_sample_data_logs-checkbox").click();

      // Click actions button
      cy.get('[data-test-subj="moreAction"]').click();
      // Reindex should show as activate
      cy.get('[data-test-subj="Reindex Action"]').click();

      // open advance option
      cy.get('[data-test-subj="advanceOptionToggle"]').click();

      // enable subset query
      cy.get('[data-test-subj="subsetOption"] #subset').click({ force: true });

      // input query to reindex subset
      cy.get('[data-test-subj="queryJsonEditor"] textarea').focus().clear().type('{"query":{"match":{"ip":"135.201.60.64"}}}', {
        parseSpecialCharSequences: false,
      });

      // create destination
      cy.get('[data-test-subj="createIndexButton"]').click();
      cy.contains("Create Index");

      cy.get('[placeholder="Specify a name for the new index."]').type(REINDEX_NEW_CREATED).blur();
      cy.wait(1000);

      // import setting and mapping
      cy.get('[data-test-subj="importSettingMappingBtn"]').click();
      cy.get('[data-test-subj="import-settings-opensearch_dashboards_sample_data_logs"]').click();

      cy.wait(10);
      cy.contains(/have been import successfully/);

      cy.get('[data-test-subj="flyout-footer-action-button"]').click({
        force: true,
      });

      // click to perform reindex
      cy.get('[data-test-subj="reindexConfirmButton"]').click();
      cy.wait(10);
      cy.contains(/Successfully started reindexing/);

      cy.wait(10000);
      // Type in REINDEX_DEST in search input
      cy.get(`input[type="search"]`).focus().type(REINDEX_NEW_CREATED);

      // Confirm we only see REINDEX_DEST in table
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain(REINDEX_NEW_CREATED);
        // subset data number
        expect($tr, "item").to.contain(13);
      });
    });
  });
});
