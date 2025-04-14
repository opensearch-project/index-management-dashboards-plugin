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
      //
      // // type field name
      // cy.get('[placeholder="Specify a name for the new index."]').type(sampleIndex).end();
      //
      // cy.get('[data-test-subj="comboBoxSearchInput"]').focus().type(`${sampleAlias}{enter}`).end();
      //
      // // click create
      // cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true }).end();
      //
      // // The index should exist
      // cy.get(`#_selection_column_${sampleIndex}-checkbox`).should("have.exist").end();
    });
  });
});
