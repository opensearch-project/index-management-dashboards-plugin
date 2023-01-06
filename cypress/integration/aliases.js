/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const SAMPLE_INDEX_PREFIX = "index-for-alias-test";
const SAMPLE_ALIAS_PREFIX = "alias-for-test";
const CREATE_ALIAS = "create-alias";
const EDIT_INDEX = "index-edit-index-for-alias-test";

describe("Aliases", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
    for (let i = 0; i < 11; i++) {
      cy.createIndex(`${SAMPLE_INDEX_PREFIX}-${i}`, null);
    }
    cy.createIndex(EDIT_INDEX, null);
    for (let i = 0; i < 30; i++) {
      cy.addAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`, `${SAMPLE_INDEX_PREFIX}-${i % 11}`);
    }
    cy.removeAlias(`${SAMPLE_ALIAS_PREFIX}-0`);
    cy.addAlias(`${SAMPLE_ALIAS_PREFIX}-0`, `${SAMPLE_INDEX_PREFIX}-*`);
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/aliases`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched / sorted / paginated", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="pagination-button-1"]').should("exist");
      cy.get('[placeholder="Search..."]').type("alias-for-test-0{enter}");
      cy.contains("alias-for-test-0");
      cy.get(".euiTableRow").should("have.length", 1);
      cy.get('[data-test-subj="comboBoxSearchInput"]').type("closed{enter}");

      cy.contains("You have no aliases.");
    });
  });

  describe("shows more modal", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type("alias-for-test-0{enter}");
      cy.contains("alias-for-test-0");
      cy.get(".euiTableRow").should("have.length", 1);
      cy.get('.euiTableRowCell [data-test-subj="8 more"]')
        .click()
        .get('[data-test-subj="indices-table"] .euiTableRow')
        .should("have.length", 10);
    });
  });

  describe("can create a alias with wildcard and specific name", () => {
    it("successfully", () => {
      cy.get('[data-test-subj="Create AliasButton"]').click();
      cy.get('[data-test-subj="form-name-alias"]').type(CREATE_ALIAS);
      cy.get('[data-test-subj="form-name-indexArray"] [data-test-subj="comboBoxSearchInput"]').type(
        `${EDIT_INDEX}{enter}${SAMPLE_INDEX_PREFIX}-*{enter}`
      );
      cy.get(".euiModalFooter .euiButton--fill").click().get('[data-test-subj="9 more"]').should("exist");
    });
  });

  describe("can edit / delete a alias", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_ALIAS_PREFIX}-0{enter}`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-0`);
      cy.get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="editAction"]')
        .should("be.disabled")
        .get(`#_selection_column_${SAMPLE_ALIAS_PREFIX}-0-checkbox`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="editAction"]')
        .click()
        .get('[data-test-subj="form-name-indexArray"] [data-test-subj="comboBoxInput"]')
        .click()
        .type(`${EDIT_INDEX}{enter}`)
        .get(`[title="${SAMPLE_INDEX_PREFIX}-0"] button`)
        .click()
        .get(`[title="${SAMPLE_INDEX_PREFIX}-1"] button`)
        .click()
        .get(".euiModalFooter .euiButton--fill")
        .click()
        .end();

      cy.get('[data-test-subj="7 more"]').should("exist");

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
      cy.get(`#_selection_column_${SAMPLE_ALIAS_PREFIX}-0-checkbox`).should("not.exist");
    });
  });

  after(() => {
    cy.deleteAllIndices();
    for (let i = 0; i < 30; i++) {
      cy.removeAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`);
    }
    cy.removeAlias(CREATE_ALIAS);
  });
});
