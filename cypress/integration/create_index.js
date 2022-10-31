/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const SAMPLE_INDEX = "index-specific-index";

describe("Create Index", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
    cy.deleteTemplate("index-common-template");
    cy.deleteTemplate("index-specific-template");
    cy.createIndexTemplate("index-common-template", {
      index_patterns: ["index-*"],
      template: {
        aliases: {
          alias_for_common_1: {},
          alias_for_common_2: {},
        },
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
        },
      },
    });
    cy.createIndexTemplate("index-specific-template", {
      index_patterns: ["index-specific-*"],
      priority: 1,
      template: {
        aliases: {
          alias_for_specific_1: {},
        },
        mappings: {
          properties: {
            text: {
              type: "text",
            },
          },
        },
      },
    });
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
      cy.get('[placeholder="Please enter the name for your index"]').type(SAMPLE_INDEX).blur();

      cy.get('[data-test-subj="comboBoxSearchInput"]').get('[title="alias_for_specific_1"]').should("exist");

      cy.get('[data-test-subj="comboBoxSearchInput"]').type("some_test_alias{enter}");
      // add a field
      cy.get('[data-test-subj="create index add field button"]').click().end();

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true });

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX}-checkbox`).should("have.exist");

      // check the index detail
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/create-index/${SAMPLE_INDEX}`);

      // index name and alias should exist
      cy.get(`[value="${SAMPLE_INDEX}"]`)
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
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
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
        .click({ force: true })
        .end()
        .get('[data-test-subj="change_diff_confirm-confirm"]')
        .click();

      // check the index
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .get("#index-detail-modal-alias")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get(`[value="${SAMPLE_INDEX}"]`)
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
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .get("#index-detail-modal-settings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[placeholder="The number of replica shards each primary shard should have."]')
        .type(2)
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click({ force: true })
        .get('[data-test-subj="change_diff_confirm-confirm"]')
        .click();

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .get("#index-detail-modal-settings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[placeholder="The number of replica shards each primary shard should have."]').should("have.value", 12);
    });

    it("Update mappings successfully", () => {
      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .get("#index-detail-modal-mappings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[data-test-subj="create index add field button"]')
        .click()
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click({ force: true })
        .get('[data-test-subj="change_diff_confirm-confirm"]')
        .click();

      cy.get(`[data-test-subj="view-index-detail-button-${SAMPLE_INDEX}"]`)
        .click()
        .get("#index-detail-modal-mappings")
        .click()
        .get('[data-test-subj="detail-modal-edit"]')
        .click();

      cy.get('[data-test-subj="mapping-visual-editor-1-field-type"]').should("have.value", "text").end();
    });
  });
});
