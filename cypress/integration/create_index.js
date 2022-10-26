/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

describe("Create Index", () => {
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

    it("Create a index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Please enter the name for your index"]').type("index_simple_index");
      cy.get('[data-test-subj="comboBoxSearchInput"]').type("some_test_alias{enter}");
      // add a field
      cy.get('[data-test-subj="create index add field button"]').click().end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click();

      // The index should exist
      cy.get("#_selection_column_index_simple_index-checkbox").should("have.exist");

      // check the index detail
      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]').click();
      cy.get("#index-detail-modal-alias").click();
      cy.get('[data-test-subj="detail-modal-edit"]').click();

      // index name and alias should exist
      cy.get('[value="index_simple_index"]')
        .should("have.exist")
        .end()
        .get('[title="some_test_alias"]')
        .should("have.exist")
        .end()
        .get('[data-test-subj="mapping-visual-editor-0-field-type"]')
        .should("have.value", "text")
        .end();
    });

    it("Update alias successfully", () => {
      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-alias")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      // add a alias and remove the exist alias
      cy.get('[data-test-subj="comboBoxSearchInput"]')
        .type("some_new_test_alias{enter}")
        .end()
        .get('[title="some_test_alias"] .euiBadge__iconButton')
        .click()
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click();

      // check the index
      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-alias")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[value="index_simple_index"]')
        .should("exist")
        .end()
        .get('[title="some_test_alias"]')
        .should("not.exist")
        .end()
        .get('[title="some_new_test_alias"]')
        .should("exist")
        .end();
    });

    it("Update settings successfully", () => {
      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-settings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[placeholder="The number of replica shards each primary shard should have."]')
        .type(2)
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click();

      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-settings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[placeholder="The number of replica shards each primary shard should have."]').should("have.value", 12);
    });

    it("Update mappings successfully", () => {
      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-mappings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[data-test-subj="create index add field button"]').click().end().get('[data-test-subj="createIndexCreateButton"]').click();

      cy.get('[data-test-subj="view-index-detail-button-index_simple_index"]')
        .click()
        .get("#index-detail-modal-mappings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[data-test-subj="mapping-visual-editor-1-field-type"]').should("have.value", "text").end();
    });
  });
});
