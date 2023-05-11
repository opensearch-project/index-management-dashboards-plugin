/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

const sampleIndex = "index-refresh";

describe("Refresh Index", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
    for (let i = 0; i < 2; i++) {
      cy.createIndex(`${sampleIndex}-${i}`, null);
    }
  });

  describe("can be refreshed", () => {
    beforeEach(() => {
      // Visit ISM OSD
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/indices`);
      cy.contains("Rows per page", { timeout: 60000 });
    });

    it("Refresh all indexes successfully", () => {
      cy.get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="Refresh Index Action"]')
        .click()
        .get('[data-test-subj="refreshConfirmButton"]')
        .click()
        .end();

      cy.contains(`Refresh all open indexes successfully`).end();
    });

    it("Refresh selected index successfully", () => {
      cy.get(`[data-test-subj="checkboxSelectRow-${sampleIndex}-0"]`)
        .click()
        .get(`[data-test-subj="checkboxSelectRow-${sampleIndex}-1"]`)
        .click()
        .get('[data-test-subj="moreAction"] button')
        .click()
        .get('[data-test-subj="Refresh Index Action"]')
        .click()
        .get('[data-test-subj="refreshConfirmButton"]')
        .click()
        .end();

      cy.contains(`Refresh index [${sampleIndex}-0,${sampleIndex}-1] successfully`).end();
    });
  });

  after(() => {
    cy.deleteAllIndices();
  });
});
