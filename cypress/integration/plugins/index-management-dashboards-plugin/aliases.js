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
    // Intercept the specific POST request
    cy.intercept("POST", "/api/ism/apiCaller", (req) => {
      if (req.body.data && req.body.data.name === "**" && req.body.data.s === "alias:desc" && req.body.endpoint === "cat.aliases") {
        req.alias = "apiCaller"; // Assign an alias directly if the condition is met
      }
    });

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/aliases`);

    // Wait for 120 seconds for OSD to start.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    // cy.wait(120000);

    const startTime = new Date().getTime();

    // Wait for the API call to complete
    cy.wait("@apiCaller", { timeout: 240000 }).then(() => {
      // Log the calculated duration
      const endTime = new Date().getTime();
      const duration = endTime - startTime; // Duration in milliseconds
      cy.log(`@apiCaller completed in ${duration} milliseconds`);
    });

    // Common text to wait for to confirm page loaded, give up to 120 seconds for initial load
    cy.contains("Rows per page", { timeout: 120000 }).should("be.visible");
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

  describe("can clear cache for an alias", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_ALIAS_PREFIX}-0{enter}`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-0`);
      cy.get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="ClearCacheAction"]')
        .should("be.disabled")
        .get(`#_selection_column_${SAMPLE_ALIAS_PREFIX}-0-checkbox`)
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
      cy.contains(`Cache for ${SAMPLE_ALIAS_PREFIX}-0 has been successfully cleared.`);
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
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_ALIAS_PREFIX}-1{enter}`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-10`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-11`);
      cy.contains(`${sample_alias}`);
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

      // Flush btn should be disabled if no items selected
      cy.get('[data-test-subj="moreAction"] button').click().get('[data-test-subj="Flush Action"]').should("be.disabled").end();

      // Select an alias
      cy.get(`#_selection_column_${sample_alias}-checkbox`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="Flush Action"]')
        .should("not.be.disabled")
        .click()
        .end();

      // Check for flush index modal
      cy.contains("Flush alias");

      cy.get('[data-test-subj="flushConfirmButton"]').should("not.be.disabled").click();

      // Check for success toast
      cy.contains(`The alias ${sample_alias} has been successfully flushed.`);

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

  describe("can refresh aliases", () => {
    it("successfully", () => {
      cy.get('[placeholder="Search..."]').type(`${SAMPLE_ALIAS_PREFIX}-1{enter}`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-10`);
      cy.contains(`${SAMPLE_ALIAS_PREFIX}-11`);

      // If no alias is selected, refresh button is disabled
      cy.get('[data-test-subj="moreAction"] button').click().get('[data-test-subj="refreshAction"]').should("be.disabled").end();

      // Refresh multiple aliases
      cy.get(`#_selection_column_${SAMPLE_ALIAS_PREFIX}-10-checkbox`)
        .click()
        .get(`#_selection_column_${SAMPLE_ALIAS_PREFIX}-11-checkbox`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="refreshAction"]')
        .click()
        .get('[data-test-subj="refreshConfirmButton"]')
        .click()
        .end();

      cy.contains(`2 aliases [${SAMPLE_ALIAS_PREFIX}-10, ${SAMPLE_ALIAS_PREFIX}-11] have been successfully refreshed.`).end();
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
