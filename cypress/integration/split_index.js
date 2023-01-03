/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const sampleIndex = "index-split";
const sampleAlias = "alias-split";

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

    let splitNumber = 2;
    let replicaNumber = 1;
    it("Create an index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Specify a name for the new index."]').type(sampleIndex).end();

      cy.get('[data-test-subj="comboBoxSearchInput"]').focus().type(`${sampleAlias}`).end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true }).end();

      // The index should exist
      cy.get(`#_selection_column_${sampleIndex}-checkbox`).should("have.exist").end();

      cy.get(`[data-test-subj="viewIndexDetailButton-${sampleIndex}"]`).click().end();
      cy.get("#indexDetailModalSettings").click().end();

      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').then(($shardNumber) => {
        splitNumber = $shardNumber.attr("title") * 2;
      });

      cy.get("#indexDetailModalAlias").click().end();
      cy.get(`[title="${sampleAlias}"]`).should("exist").end();

      // Update Index status to blocks write otherwise we can't apply split operation on it
      cy.updateIndexSettings(sampleIndex, { "index.blocks.write": "true" }).end();
    }); // create index

    it("Split successfully", () => {
      const targetIndex = `${sampleIndex}` + "-target";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()
        .end()
        .get('[data-test-subj="moreAction"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        // Target Index Name is required
        .get('[data-test-subj="targetIndexNameInput"]')
        .type(`${targetIndex}`)
        .end()
        // Number of shards after split is required
        .get('[data-test-subj="numberOfShardsInput"]')
        .type(`${splitNumber}{arrowdown}{enter}`)
        .end()
        .get('[data-test-subj="numberOfReplicasInput"]')
        .type(`${replicaNumber}`)
        .end()
        .get('[data-test-subj="splitButton"]')
        .click()
        .end();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click().end();
      cy.get("#indexDetailModalSettings").click().end();
      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').should("have.text", `${splitNumber}`).end();
      cy.get('[data-test-subj="form-name-index.number_of_replicas"] .euiText').should("have.text", `${replicaNumber}`).end();
    }); // Split

    it("Split successfully with advanced setting", () => {
      const targetIndex = `${sampleIndex}` + "-setting";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()
        .end()
        .get('[data-test-subj="moreAction"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        .get("[data-test-subj=targetIndexNameInput]")
        .type(`${targetIndex}`)
        .end()
        // Instead of input shard number at shard field, another option is to populate it in advanced setting
        .get('[aria-controls="accordionForCreateIndexSettings"]')
        .click()
        .end()
        .get('[data-test-subj="codeEditorContainer"] textarea')
        .focus()
        // Need to remove the default {} in advanced setting
        .clear()
        .type(`{"index.number_of_shards": "${splitNumber}", "index.number_of_replicas": "${replicaNumber}"}`, {
          parseSpecialCharSequences: false,
        })
        .end()
        .get('[data-test-subj="splitButton"]')
        .click()
        .end();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click().end();
      cy.get("#indexDetailModalSettings").click().end();
      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').should("have.text", `${splitNumber}`).end();
      cy.get('[data-test-subj="form-name-index.number_of_replicas"] .euiText').should("have.text", `${replicaNumber}`).end();
    }); // advanced setting

    it("Split successfully with alias", () => {
      const targetIndex = `${sampleIndex}` + "-alias";
      const newAlias = "alias-new";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()
        .end()
        .get('[data-test-subj="moreAction"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        .get("[data-test-subj=targetIndexNameInput]")
        .type(`${targetIndex}`)
        .end()
        .get('[data-test-subj="numberOfShardsInput"]')
        .type(`${splitNumber}{arrowdown}{enter}`)
        .end()
        // Assign to an existing alias and a new alias
        .get('[data-test-subj="form-name-aliases"] [data-test-subj="comboBoxSearchInput"]')
        .type(`${sampleAlias}{enter}${newAlias}{enter}`)
        .end()
        .get('[data-test-subj="splitButton"]')
        .click()
        .end();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click().end();
      // Verify alias associated with the new index
      cy.get("#indexDetailModalAlias").click().end();
      cy.get(`[title="${newAlias}"]`).should("exist").end();
      cy.get(`[title="${sampleAlias}"]`).should("exist").end();
    }); // Create with alias

    it("Update blocks write to true", () => {
      // Set index to not blocks write
      cy.updateIndexSettings(sampleIndex, { "index.blocks.write": "false" }).end();
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()
        .end()
        .get('[data-test-subj="moreAction"]')
        .click()
        .end()
        .get('[data-test-subj="Split Action"]')
        .click()
        .end()
        // Index can't be split if it's blocks write status is not true
        .get('[data-test-subj="splitButton"]')
        .should("have.class", "euiButton-isDisabled")
        .end()
        .wait(1000)
        // Set index to blocks write
        .get('[data-test-subj="set-indexsetting-button"]')
        .click()
        .end()
        .get('[data-test-subj="splitButton"]')
        .click()
        .end();
    }); // Blocks write
  });
});
