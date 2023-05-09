/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH, BACKEND_BASE_PATH } from "../../../utils/constants";

describe("Data stream", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteTemplate("index-common-template");
    cy.createIndexTemplate("index-common-template", {
      index_patterns: ["ds-*"],
      data_stream: {},
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
    cy.request({
      url: `${BACKEND_BASE_PATH}/_data_stream/*`,
      method: "DELETE",
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/data-streams`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Data streams", { timeout: 60000 });
  });

  describe("can create a data stream", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="Create data streamButton"]').click();
      cy.get('[data-test-subj="form-row-name"] [data-test-subj="comboBoxSearchInput"]').type(`ds-{enter}`);
      cy.get("body").click();
      cy.get('[data-test-subj="CreateDataStreamCreateButton"]').click();
      cy.contains("ds- has been successfully created.");
    });
  });

  describe("can be searched / sorted / paginated", () => {
    it("successfully", () => {
      cy.contains("ds-");
      cy.contains("index-common-template");
    });
  });

  describe("can clear caches for a data stream", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="ClearCacheAction"]')
        .should("be.disabled")
        .get(`#_selection_column_ds--checkbox`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="ClearCacheAction"]')
        .click();

      // Check for clear cache index modal
      cy.contains("Clear cache");
      cy.get('[data-test-subj="ClearCacheConfirmButton"]').should("not.be.disabled");
      // click to clear caches
      cy.get('[data-test-subj="ClearCacheConfirmButton"]').click();
      // Check for success toast
      cy.contains("Clear caches for [ds-] successfully");
    });
  });

  describe("can delete a data stream", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="deleteAction"]')
        .should("be.disabled")
        .get(`#_selection_column_ds--checkbox`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="deleteAction"]')
        .click();
      // The confirm button should be disabled
      cy.get('[data-test-subj="deleteConfirmButton"]').should("be.disabled");
      // type delete
      cy.wait(500).get('[data-test-subj="deleteInput"]').type("delete");
      cy.get('[data-test-subj="deleteConfirmButton"]').should("not.be.disabled");
      // click to delete
      cy.get('[data-test-subj="deleteConfirmButton"]').click();
      // the alias should not exist
      cy.wait(500);
      cy.get(`#_selection_column_ds--checkbox`).should("not.exist");
    });
  });

  after(() => {
    cy.request({
      url: `${BACKEND_BASE_PATH}/_data_stream`,
      method: "DELETE",
      failOnStatusCode: false,
    });
    cy.deleteTemplate("index-common-template");
  });
});
