/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

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
      cy.addIndexAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`, `${SAMPLE_INDEX_PREFIX}-${i % 11}`);
    }
    cy.removeIndexAlias(`${SAMPLE_ALIAS_PREFIX}-0`);
    cy.addIndexAlias(`${SAMPLE_ALIAS_PREFIX}-0`, `${SAMPLE_INDEX_PREFIX}-*`);
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/aliases`);

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

      cy.contains("There are no aliases matching your applied filters. Reset your filters to view your aliases.");
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
      cy.get('[data-test-subj="Create aliasButton"]').click();
      cy.get('[data-test-subj="form-name-alias"]').type(CREATE_ALIAS);
      cy.get('[data-test-subj="form-name-indexArray"] [data-test-subj="comboBoxSearchInput"]').type(
        `${EDIT_INDEX}{enter}${SAMPLE_INDEX_PREFIX}-*{enter}`
      );
      cy.get(".euiModalFooter .euiButton--fill").click({ force: true }).get('[data-test-subj="9 more"]').should("exist");
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
        .click({ force: true })
        .end();

      cy.get('[data-test-subj="7 more"]').should("exist");
    });
  });

  describe("can flush an alias", () => {
    it("successfully flush an index", () => {
      let sample_alias = `${SAMPLE_ALIAS_PREFIX}-${1}`;
      // Sort all aliases in asc order to make it at first page
      cy.contains("Alias name").click();
      // Confirm we have our initial alias
      cy.contains(sample_alias);
      // index a test doc
      cy.request({
        method: "POST",
        url: `${Cypress.env("openSearchUrl")}/${sample_alias}/_doc`,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: { test: "test" },
      });

      // confirm uncommitted_operations is 1 after indexing doc
      cy.request({
        method: "GET",
        url: `${Cypress.env("openSearchUrl")}/${sample_alias}/_stats/translog`,
      }).then((response) => {
        let response_obj = JSON.parse(response["allRequestResponses"][0]["Response Body"]);
        let num = response_obj["_all"]["total"]["translog"]["uncommitted_operations"];
        expect(num).to.equal(1);
      });

      cy.get('[data-test-subj="moreAction"]').click();
      // Flush btn should be disabled if no items selected
      cy.get('[data-test-subj="Flush Action"]').should("have.class", "euiContextMenuItem-isDisabled");

      // Select an alias
      cy.get(`[data-test-subj="checkboxSelectRow-${sample_alias}"]`).check({
        force: true,
      });

      cy.get('[data-test-subj="moreAction"]').click();
      // Flush btn should be enabled
      cy.get('[data-test-subj="Flush Action"]').should("exist").should("not.have.class", "euiContextMenuItem-isDisabled").click();

      // Check for flush index modal
      cy.contains("Flush alias");

      cy.get('[data-test-subj="Flush Confirm Button"]').click();

      // Check for success toast
      cy.contains(`Flush [${sample_alias}] successfully`);

      // confirm uncommitted_operations is 0 after flush
      cy.request({
        method: "GET",
        url: `${Cypress.env("openSearchUrl")}/${sample_alias}/_stats/translog`,
      }).then((response) => {
        let response_obj = JSON.parse(response["allRequestResponses"][0]["Response Body"]);
        let num = response_obj["_all"]["total"]["translog"]["uncommitted_operations"];
        expect(num).to.equal(0);
      });
    });
  });

  after(() => {
    cy.deleteAllIndices();
    for (let i = 0; i < 30; i++) {
      cy.removeIndexAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`);
    }
    cy.removeIndexAlias(CREATE_ALIAS);
  });
});
