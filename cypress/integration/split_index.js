/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const SAMPLE_INDEX = "index-split";
const SAMPLE_INDEX_SPLIT = `${SAMPLE_INDEX}-target`;

describe("Split Index", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
  });

  describe("can be created and updated", () => {
    beforeEach(() => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/indices`);
      cy.contains("Rows per page", { timeout: 60000 });
    });

    let split_number = 2;
    it("Create an index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Please enter the name for your index"]').type(SAMPLE_INDEX).end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true }).end();

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX}-checkbox`).should("have.exist").end();

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`).click().end().get("#index-detail-modal-settings").click().end();

      cy.get('[placeholder="The number of primary shards in the index. Default is 1."]').then(($shardNumber) => {
        split_number = $shardNumber.val() * 2;
      });

      // Update Index status to blocks write otherwise we can't apply split operation on it
      cy.updateIndexSettings(SAMPLE_INDEX, { "index.blocks.write": "true" }).end();
    }); // create index

    it("Split successfully", () => {
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`)
        .click()
        .end()
        .get('[data-test-subj="More Action"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end();

      cy.wait(1000)
        // Target Index Name is required
        .get('[data-test-subj="form-name-targetIndex"] input')
        .type(`${SAMPLE_INDEX_SPLIT}`)
        .end()
        // Number of shards after split is required
        .get('[data-test-subj="form-name-index.number_of_shards"] input')
        .type(`${split_number}`)
        .end()
        .get('[data-test-subj="flyout-footer-action-button"]')
        .click()
        .end();

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX_SPLIT}-checkbox`).should("have.exist");

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX_SPLIT}"]`)
        .click()
        .end()
        .get("#index-detail-modal-settings")
        .click()
        .end();

      cy.get('[placeholder="The number of primary shards in the index. Default is 1."]').should("have.value", `${split_number}`).end();
    }); // Split

    it("Split successfully with advanced setting", () => {
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`)
        .click()
        .end()
        .get('[data-test-subj="More Action"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end();

      cy.wait(1000)
        .get('[data-test-subj="form-name-targetIndex"] input')
        .type(`${SAMPLE_INDEX_SPLIT}-1`)
        .end()
        // Instead of input shard number at shard field, another option is to populate it in advanced setting
        .get('[aria-controls="accordion_for_create_index_settings"]')
        .click()
        .end()
        .get('[data-test-subj="codeEditorContainer"] textarea')
        .focus()
        // Need to remove the default {} in advanced setting
        .clear()
        .type(`{"index.number_of_shards": "${split_number}"}`, { parseSpecialCharSequences: false })
        .end()
        .get('[data-test-subj="flyout-footer-action-button"]')
        .click()
        .end();

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX_SPLIT}-checkbox`).should("have.exist");

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX_SPLIT}"]`)
        .click()
        .end()
        .get("#index-detail-modal-settings")
        .click()
        .end();

      cy.get('[placeholder="The number of primary shards in the index. Default is 1."]').should("have.value", `${split_number}`).end();
    }); // advanced setting

    it("Update blocks write to true", () => {
      // Set index to not blocks write
      cy.updateIndexSettings(SAMPLE_INDEX, { "index.blocks.write": "false" }).end();
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`)
        .click()
        .end()
        .get('[data-test-subj="More Action"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        // Index can't be split if it's blocks write status is not true
        .get('[data-test-subj="flyout-footer-action-button"]')
        .should("have.class", "euiButton-isDisabled")
        .end()
        // Set index to blocks write
        .get('[data-test-subj="set-indexsetting-button"]')
        .click()
        .end()
        .get('[data-test-subj="flyout-footer-action-button"]')
        .click()
        .end();
    }); // Blocks write
  });
});
