/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from "../support/constants";

describe("Snapshots", () => {
  before(() => {
    // Delete any existing indices
    cy.deleteAllIndices();

    // Load ecommerce data
    cy.request({
      method: "POST",
      url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/ecommerce`,
      headers: {
        "osd-xsrf": true,
      },
    }).then((response) => {
      expect(response.status).equal(200);
    });

    // Load flight data
    cy.request({
      method: "POST",
      url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/flights`,
      headers: {
        "osd-xsrf": true,
      },
    }).then((response) => {
      expect(response.status).equal(200);
    });

    // Load web log data
    cy.request({
      method: "POST",
      url: `${Cypress.env("opensearch_dashboards")}/api/sample_data/logs`,
      headers: {
        "osd-xsrf": true,
      },
    }).then((response) => {
      expect(response.status).equal(200);
    });
  });

  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Snapshots Dashboard
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/snapshots`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Restore", { timeout: 60000 });
  });

  describe("Repository can be created", () => {
    it("successfully creates a new repository", () => {
      // Create repository to store snapshots
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/repositories`);

      // Route to create repository page
      cy.contains("Create repository").click({ force: true });

      // Type in repository name
      cy.get(`input[data-test-subj="repoNameInput"]`).focus().type("test_repo");

      // Type in repository location
      cy.get(`input[placeholder="e.g., /mnt/snapshots"]`).focus().type("~/Desktop");

      // Click Add button
      cy.get("button").contains("Add").click({ force: true });

      // Confirm repository created
      cy.contains("test_repo");
    });
  });

  describe("Snapshot can be created", () => {
    it("successfully creates a new snapshot", () => {
      // Click Take snapshot button
      cy.get("button").contains("Take snapshot").click({ force: true });

      // Type in Snapshot name
      cy.get(`input[data-test-subj="snapshotNameInput"]`).type("test_snapshot{enter}");

      // Select indexes to be included
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("open*{enter}");

      // Confirm test_repo exists
      cy.contains("test_repo");

      // Click 'Add' button to create snapshot
      cy.get("button").contains("Add").click({ force: true });

      // check for success status and snapshot name
      cy.contains("In_progress");
      cy.contains("test_snapshot");
    });
  });
});
