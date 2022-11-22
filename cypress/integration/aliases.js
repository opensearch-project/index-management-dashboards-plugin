/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const SAMPLE_INDEX_PREFIX = "index-for-alias-test";
const SAMPLE_ALIAS_PREFIX = "alias-for-test";

describe("Search Aliases", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
    for (let i = 0; i < 6; i++) {
      cy.createIndex(`${SAMPLE_INDEX_PREFIX}-${i}`, null);
    }
    for (let i = 0; i < 30; i++) {
      cy.addAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`, `${SAMPLE_INDEX_PREFIX}-${i % 6}`);
    }
    cy.removeAlias(`${SAMPLE_ALIAS_PREFIX}-0`);
    cy.addAlias(`${SAMPLE_ALIAS_PREFIX}-0`, `${SAMPLE_INDEX_PREFIX}-*`);
    // Visit ISM OSD
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/aliases`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Rows per page", { timeout: 60000 });
  });

  describe("can be searched / sorted / paginated", () => {
    it("successfully", () => {});
  });

  // after(() => {
  //   cy.deleteTemplate("index-common-template");
  //   cy.deleteTemplate("index-specific-template");
  //   cy.deleteAllIndices();
  //   for (let i = 0; i < 30; i++) {
  //     cy.removeAlias(`${SAMPLE_ALIAS_PREFIX}-${i}`);
  //   }
  // });
});
