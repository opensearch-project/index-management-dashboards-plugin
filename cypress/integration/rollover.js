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

describe("Rollover", () => {
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

  describe("rollover", () => {
    it("rollover data stream successfully", () => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/rollover/${rolloverDataStream}`);
      cy.contains("Configure source", { timeout: 60000 });

      // click create
      cy.get('[data-test-subj="rolloverSubmitButton"]').click({ force: true });

      cy.contains(`${rolloverDataStream} has been rollovered successfully.`);
    });

    it("rollover valid alias successfully", () => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/rollover/${rolloverValidAlias}`);
      cy.contains("Configure new rollover index", { timeout: 60000 });

      // click create
      cy.get('[data-test-subj="rolloverSubmitButton"]').click({ force: true });

      cy.contains(`${rolloverValidAlias} has been rollovered successfully.`);
    });

    it("rollover invalid alias successfully", () => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/rollover/${rolloverAliasNeedTargetIndex}`);
      cy.contains("Configure new rollover index", { timeout: 60000 });

      // click create
      cy.get('[data-test-subj="rolloverSubmitButton"]').click({ force: true });

      cy.contains("Index name is required.");

      cy.get('[data-test-subj="form-row-targetIndex.index"] input').type("index-test-rollover-target");

      // click create
      cy.get('[data-test-subj="rolloverSubmitButton"]').click({ force: true });

      cy.contains(`${rolloverAliasNeedTargetIndex} has been rollovered successfully.`);
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
