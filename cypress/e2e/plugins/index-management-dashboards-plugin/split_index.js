/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

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
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`);
      cy.contains("Rows per page", { timeout: 60000 });
    });

    let splitNumber = 2;
    let replicaNumber = 1;
    it("Create an index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Specify a name for the new index."]').type(sampleIndex);

      cy.get('[data-test-subj="comboBoxSearchInput"]').focus().type(`${sampleAlias}`);

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click();

      // The index should exist
      cy.get(`#_selection_column_${sampleIndex}-checkbox`).should("have.exist");

      cy.get(`[data-test-subj="viewIndexDetailButton-${sampleIndex}"]`).click();
      cy.get("#indexDetailModalSettings", { timeout: 10000 }).click();

      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').then(($shardNumber) => {
        splitNumber = $shardNumber.attr("title") * 2;
      });

      cy.get("#indexDetailModalAlias").click();
      cy.get(`[title="${sampleAlias}"]`).should("exist");

      // Update Index status to blocks write otherwise we can't apply split operation on it
      cy.updateIndexSettings(sampleIndex, {
        "index.blocks.write": "true",
      });
    }); // create index

    it("Split successfully", () => {
      const targetIndex = `${sampleIndex}` + "-target";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()

        .get('[data-test-subj="moreAction"]')
        .click()

        .get('[data-test-subj="Split Action"]')
        .click()

        // Target Index Name is required
        .get('[data-test-subj="targetIndexNameInput"]')
        .type(`${targetIndex}`)

        // Number of shards after split is required
        .get('[data-test-subj="numberOfShardsInput"]')
        .type(`${splitNumber}{downArrow}{enter}`)

        .get('[data-test-subj="numberOfReplicasInput"]')
        .clear()
        .type(`${replicaNumber}`)

        .get('[data-test-subj="splitButton"]', { timeout: 8000 })
        .click();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click();
      cy.get("#indexDetailModalSettings", { timeout: 10000 }).click();
      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').should("have.text", `${splitNumber}`);
      cy.get('[data-test-subj="form-name-index.number_of_replicas"] input').should("have.value", `${replicaNumber}`);
    }); // Split

    it("Split successfully with advanced setting", () => {
      const targetIndex = `${sampleIndex}` + "-setting";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()

        .get('[data-test-subj="moreAction"]')
        .click()

        .get('[data-test-subj="Split Action"]')
        .click()

        .get("[data-test-subj=targetIndexNameInput]")
        .type(`${targetIndex}`)

        // Instead of input shard number at shard field, another option is to populate it in advanced setting
        .get('[aria-controls="accordionForCreateIndexSettings"]')
        .click()

        .get('[data-test-subj="codeEditorContainer"] textarea')
        .focus()
        // Need to remove the default {} in advanced setting
        .clear()
        .type(`{"index.number_of_shards": "${splitNumber}", "index.number_of_replicas": "${replicaNumber}"}`, {
          parseSpecialCharSequences: false,
        })

        .get('[data-test-subj="splitButton"]', { timeout: 8000 })
        .click();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click();
      cy.get("#indexDetailModalSettings", { timeout: 10000 }).click();
      cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').should("have.text", `${splitNumber}`);
      cy.get('[data-test-subj="form-name-index.number_of_replicas"] input').should("have.value", `${replicaNumber}`);
    }); // advanced setting

    it("Split successfully with alias", () => {
      const targetIndex = `${sampleIndex}` + "-alias";
      const newAlias = "alias-new";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()

        .get('[data-test-subj="moreAction"]')
        .click()

        .get('[data-test-subj="Split Action"]')
        .click()

        .get("[data-test-subj=targetIndexNameInput]")
        .type(`${targetIndex}`)

        .get('[data-test-subj="numberOfShardsInput"]')
        .type(`${splitNumber}{downArrow}{enter}`)

        // Assign to an existing alias and a new alias
        .get('[data-test-subj="form-name-aliases"] [data-test-subj="comboBoxSearchInput"]')
        .type(`${sampleAlias}{enter}${newAlias}{enter}`)

        .get('[data-test-subj="splitButton"]', { timeout: 8000 })
        .click();

      cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click();
      // Verify alias associated with the new index
      cy.get("#indexDetailModalAlias").click();
      cy.get(`[title="${newAlias}"]`).should("exist");
      cy.get(`[title="${sampleAlias}"]`).should("exist");
    }); // Create with alias

    it("Update blocks write to true", () => {
      // Set index to not blocks write
      cy.updateIndexSettings(sampleIndex, {
        "index.blocks.write": "false",
      });
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`)
        .click()

        .get('[data-test-subj="moreAction"]')
        .click()

        .get('[data-test-subj="Split Action"]')
        .click()

        // Index can't be split if it's blocks write status is not true
        .get('[data-test-subj="splitButton"]', { timeout: 8000 })
        .should("have.class", "euiButton-isDisabled")

        .wait(1000)
        // Set index to blocks write
        .get('[data-test-subj="set-indexsetting-button"]', { timeout: 8000 })
        .click()

        .get('[data-test-subj="splitButton"]', { timeout: 8000 })
        .click();
    }); // Blocks write
  });
});
