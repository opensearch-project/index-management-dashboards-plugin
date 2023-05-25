/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

const SAMPLE_TEMPLATE_PREFIX = "template-components-test";
const associatedTemplate = "template-for-test-associate";
const MAX_TEMPLATE_NUMBER = 30;

describe("Component templates", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteTemplate(associatedTemplate);
    cy.deleteTemplateComponents(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
    for (let i = 0; i < MAX_TEMPLATE_NUMBER; i++) {
      cy.deleteTemplateComponents(`${SAMPLE_TEMPLATE_PREFIX}-${i}`);
      cy.createTemplateComponent(`${SAMPLE_TEMPLATE_PREFIX}-${i}`, {
        template: {
          aliases: {},
          settings: {
            number_of_shards: 2,
            number_of_replicas: 1,
          },
        },
      });
    }
    cy.createIndexTemplate(associatedTemplate, {
      index_patterns: ["template-test-*"],
      priority: 100,
      composed_of: [`${SAMPLE_TEMPLATE_PREFIX}-0`, `${SAMPLE_TEMPLATE_PREFIX}-1`],
    });
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/composable-templates`);

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

  describe("can create a component template", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="Create component templateButton"]').click();
      cy.contains("Define component template");

      cy.get('[data-test-subj="form-row-name"] input').type(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.get('[data-test-subj="CreateComposableTemplateCreateButton"]').click();

      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER} has been successfully created.`);

      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
      cy.get(".euiTableRow").should("have.length", 1);
    });
  });

  describe("can update a component template", () => {
    it("successfully", () => {
      // data-test-subj={`templateDetail-${value}`}
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.get(`[data-test-subj="templateDetail-${SAMPLE_TEMPLATE_PREFIX}-0"]`).click();
      cy.contains("Define component template");
      cy.get('[data-test-subj="form-row-_meta.description"] input').type("Some description");
      cy.contains("1 unsaved changes");
      cy.get('[data-test-subj="updateTemplateButton"]').click();

      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0 has been successfully updated.`);

      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/composable-templates`);
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains("Some description");
      cy.get(".euiTableRow").should("have.length", 1);
    });
  });

  describe("can delete a component template", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.contains(`${SAMPLE_TEMPLATE_PREFIX}-0`);
      cy.get(`#_selection_column_${SAMPLE_TEMPLATE_PREFIX}-0-checkbox`).click();
      cy.get('[data-test-subj="deleteAction"]').click();
      cy.contains(/The component template will be unlinked from 1 index templates/);
      cy.contains(associatedTemplate);
      cy.get('[data-test-subj="UnlinkConfirmCheckBox"]').parent().click();
      cy.contains("Associated index templates");
      // click to delete
      cy.get('[data-test-subj="deleteConfirmUnlinkButton"]').click();
      cy.wait(500);
      cy.get(`#_selection_column_${SAMPLE_TEMPLATE_PREFIX}-0-checkbox`).should("not.exist");
    });
  });

  after(() => {
    cy.deleteTemplate(associatedTemplate);
    cy.deleteTemplateComponents(`${SAMPLE_TEMPLATE_PREFIX}-${MAX_TEMPLATE_NUMBER}`);
    for (let i = 0; i < MAX_TEMPLATE_NUMBER; i++) {
      cy.deleteTemplateComponents(`${SAMPLE_TEMPLATE_PREFIX}-${i}`);
    }
  });
});
