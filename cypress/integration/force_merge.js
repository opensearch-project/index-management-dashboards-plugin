/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const rolloverValidAlias = "rollover-valid-alias";
const rolloverAliasNeedTargetIndex = "rollover-alias-need-target-index";
const rolloverDataStream = "data-stream-rollover";
const validIndex = "index-000001";
const invalidIndex = "index-test-rollover";

describe("force_merge", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteTemplate("index-common-template");
    cy.deleteAllIndices();
    cy.request({
      url: `${Cypress.env("opensearch")}/_data_stream/*`,
      method: "DELETE",
      failOnStatusCode: false,
    });
    cy.createIndex(validIndex);
    cy.createIndex(invalidIndex);
    cy.addAlias(rolloverValidAlias, validIndex);
    cy.addAlias(rolloverAliasNeedTargetIndex, invalidIndex);
    cy.createIndexTemplate("index-common-template", {
      index_patterns: ["data-stream-*"],
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
      url: `${Cypress.env("opensearch")}/_data_stream/${rolloverDataStream}`,
      method: "PUT",
      failOnStatusCode: false,
    });
  });

  describe("force merge", () => {
    it("force merge data stream / index / alias successfully", () => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/force-merge`);
      cy.contains("Configure source index", { timeout: 60000 });

      // click create
      cy.get('[data-test-subj="forceMergeConfirmButton"]').click({ force: true });

      cy.contains("Indexes is required.");
      cy.get('[data-test-subj="sourceSelector"] [data-test-subj="comboBoxSearchInput"]').type(
        `${rolloverValidAlias}{downArrow}{enter}${rolloverAliasNeedTargetIndex}{downArrow}{enter}${rolloverDataStream}{downArrow}{enter}${validIndex}{downArrow}{enter}${invalidIndex}{downArrow}{enter}`
      );

      cy.get('[data-test-subj="forceMergeConfirmButton"]').click({ force: true });

      cy.contains(/shards are successfully force merged./);
    });
  });

  after(() => {
    cy.deleteTemplate("index-common-template");
    cy.deleteAllIndices();
    cy.request({
      url: `${Cypress.env("opensearch")}/_data_stream/*`,
      method: "DELETE",
      failOnStatusCode: false,
    });
  });
});
