/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

const sampleIndex = "index-split";
const sampleAlias = "alias-split";
let splitNumber = 2;
let replicaNumber = 1;

describe("Split Index", () => {
  before(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
      win.localStorage.setItem("home:welcome:show", "false");
    });
  });

  describe("can be created and updated", () => {
    beforeEach(() => {
      // Clear session data between tests
      Cypress.session.clearCurrentSessionData();

      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`, {
        timeout: 30000,
        onBeforeLoad: (win) => {
          win.sessionStorage.clear();
          win.localStorage.clear();
        },
      });

      // Wait for page load with proper assertion
      cy.contains("Rows per page", { timeout: 20000 }).should("be.visible");
    });

    it("Create an index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Specify a name for the new index."]').type(sampleIndex).blur();

      cy.wait(1000);

      cy.get('[data-test-subj="comboBoxSearchInput"]').focus().type(`${sampleAlias}{enter}`).end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click().end();

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
      cy.updateIndexSettings(sampleIndex, {
        "index.blocks.write": "true",
      }).end();
    }); //create the index

    it("Split successfully", () => {
      const targetIndex = `${sampleIndex}` + "-target";
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}"]`).click().end();

      cy.wait(3000);
      cy.get('[data-test-subj="moreAction"]').click().end().get('[data-test-subj="Split Action"]').click().end();
      //   // Target Index Name is required
      //   .get('[data-test-subj="targetIndexNameInput"]')
      //   .type(`${targetIndex}`)
      //   .end()
      //   // Number of shards after split is required
      //   .get('[data-test-subj="numberOfShardsInput"]')
      //   .type(`${splitNumber}{downArrow}{enter}`)
      //   .end()
      //   .get('[data-test-subj="numberOfReplicasInput"]')
      //   .clear()
      //   .type(`${replicaNumber}`)
      //   .end()
      //   .get('[data-test-subj="splitButton"]')
      //   .click()
      //   .end();
      //
      // cy.get(`[data-test-subj="viewIndexDetailButton-${targetIndex}"]`).click().end();
      // cy.get("#indexDetailModalSettings").click().end();
      // cy.get('[data-test-subj="form-name-index.number_of_shards"] .euiText').should("have.text", `${splitNumber}`).end();
      // cy.get('[data-test-subj="form-name-index.number_of_replicas"] input').should("have.value", `${replicaNumber}`).end();
    }); // Split
  });
});
