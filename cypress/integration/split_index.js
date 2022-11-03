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

      // Update Index status to blocks write otherwise we can't apply split operation on it
      cy.get('[placeholder="Advanced Settings"]')
        .click()
        .end()
        .get('[placeholder="Specify advanced index settings"] textarea')
        .focus()
        .clear({ force: true })
        .type('{"blocks.write": true}', { force: true, parseSpecialCharSequences: false })
        .blur()
        .end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true }).end();

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX}-checkbox`).should("have.exist").end();

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .end()
        .get("#index-detail-modal-settings")
        .click()
        .end()
        .get('[data-test-subj="detail-modal-edit"]')
        .click()
        .end();

      cy.get('[placeholder="The number of primary shards in the index. Default is 1."]').then(($shardNumber) => {
        split_number = $shardNumber.val() * 2;
      });

      // Update Index status to blocks write otherwise we can't apply split operation on it
      /*
      cy.updateIndexSettings(SAMPLE_INDEX, {"index.blocks.write":"true"})
        .end()

       */
    });

    it("Split successfully", () => {
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`)
        .click()
        .end()
        .get('[data-test-subj="More Action"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        .get('[data-test-subj="Split Index Confirm"]')
        .should("be.disabled")
        .end()
        .get('[data-test-subj="Target Index Name"]')
        .type(`${SAMPLE_INDEX_SPLIT}`)
        .end()
        .get('[placeholder="Should be N times of the original index."]')
        .type(`${split_number}`)
        .end()
        .get('[data-test-subj="Split Index Confirm"]')
        .click()
        .end();

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX_SPLIT}-checkbox`).should("have.exist");

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX_SPLIT}"]`)
        .click()
        .end()
        .get("#index-detail-modal-settings")
        .click()
        .end()
        .get('[data-test-subj="detail-modal-edit"]')
        .click()
        .end();

      cy.get('[placeholder="The number of primary shards in the index. Default is 1."]').should("have.value", `${split_number}`).end();
    }); // Split
  });
});
