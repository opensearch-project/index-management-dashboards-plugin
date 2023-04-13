/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

const SAMPLE_TEMPLATE_PREFIX = "index-for-alias-test";
const MAX_TEMPLATE_NUMBER = 30;

describe("Templates", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteTemplate(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
    for (let i = 0; i < MAX_TEMPLATE_NUMBER; i++) {
      cy.deleteTemplate(`${SAMPLE_TEMPLATE_PREFIX}-${i}`);
      cy.createIndexTemplate(`${SAMPLE_TEMPLATE_PREFIX}-${i}`, {
        index_patterns: ["template-test-*"],
        priority: i,
        template: {
          aliases: {},
          settings: {
            number_of_shards: 2,
            number_of_replicas: 1,
          },
        },
      });
    }
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/templates`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched / sorted / paginated", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="pagination-button-1"]').should("exist");
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.get(".euiTableRow").should("have.length", 1);
    });
  });

  describe("can create a template", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="Create templateButton"]').click();
      cy.contains("Template settings");

      cy.get('[data-test-subj="form-row-name"] input').type(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.get('[data-test-subj="form-row-index_patterns"] [data-test-subj="comboBoxSearchInput"]').type("test{enter}");
      cy.get('[data-test-subj="CreateIndexTemplateCreateButton"]').click();

      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER} has been successfully created.`);

      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.get(".euiTableRow").should("have.length", 1);
    });
  });

  describe("can delete a template", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.get(`#_selection_column_${SAMPLE_TEMPLATE_PREFIX}-0-checkbox`).click();

      cy.get('[data-test-subj="moreAction"] button').click().get('[data-test-subj="deleteAction"]').click();
      // The confirm button should be disabled
      cy.get('[data-test-subj="deleteConfirmButton"]').should("be.disabled");
      // type delete
      cy.wait(500).get('[data-test-subj="deleteInput"]').type("delete");
      cy.get('[data-test-subj="deleteConfirmButton"]').should("not.be.disabled");
      // click to delete
      cy.get('[data-test-subj="deleteConfirmButton"]').click();
      // the alias should not exist
      cy.wait(500);
      cy.get(`#_selection_column_${SAMPLE_TEMPLATE_PREFIX}-0-checkbox`).should("not.exist");
    });
  });

  after(() => {
    cy.deleteTemplate(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
    for (let i = 0; i < MAX_TEMPLATE_NUMBER; i++) {
      cy.deleteTemplate(`${SAMPLE_TEMPLATE_PREFIX}-${i}`);
    }
  });
});
