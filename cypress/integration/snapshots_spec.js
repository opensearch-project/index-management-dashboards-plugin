/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from "../support/constants";

describe("Snapshots", () => {
  before(() => {
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
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/snapshots`);

      // delete any existing indices
      cy.deleteAllIndices();

      // create test indices
      cy.createIndex("test_index_1");
      cy.createIndex("test_index_2");
      cy.createIndex("test_index_3");

      // wait needed here to enable cypress to find "Take snapshot" button.  Timeout 
      // cannot be used with cy.createIndex
      cy.wait(5000);

      // Click Take snapshot button
      cy.get("button").contains("Take snapshot").click({ force: true });

      // Confirm test_repo exists and is in the Select repo field
      cy.contains("test_repo");

      // Type in Snapshot name
      cy.get(`input[data-test-subj="snapshotNameInput"]`).type("test_snapshot{enter}");

      // Select all indexes to be included
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_1{enter}");
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_2{enter}");
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_3{enter}");

      // Click 'Add' button to create snapshot
      cy.get("button").contains("Add", { timeout: 3000 }).click({ force: true });

      // check for success status and snapshot name
      cy.get("button").contains("Refresh").click({ force: true });

      cy.contains("Success");

      // remove all indices
      cy.deleteAllIndices();
    });
  });

  describe("Snapshot can be restored", () => {
    it("Successfully restores indices from snapshot", () => {
      // Select test snapshot
      cy.get(`[data-test-subj="checkboxSelectRow-test_repo:test_snapshot"]`).check({ force: true });

      // click "Restore" button
      cy.get(`[data-test-subj="restoreButton"]`).click({ force: true });

      // Check for restore flyout
      cy.contains("Restore snapshot");

      // enter a prefix
      cy.get(`input[data-test-subj="prefixInput"]`).type("restored_");

      // Click restore snapshot button
      cy.get("button").contains("Restore snapshot").click({ force: true });

      // Check for success toast
      cy.contains("Restored snapshot test_snapshot to repository test_repo");
    });
  });

  describe("Snapshot can be deleted", () => {
    it("deletes snapshot successfully", async () => {
      // Select test snapshot
      cy.get(`[data-test-subj="checkboxSelectRow-test_repo:test_snapshot"]`).check({ force: true });

      // click "Delete" button
      cy.get("button").contains("Delete", { timeout: 3000 }).click({ force: true });

      // click "Delete snapshot" button on modal
      cy.get("button").contains("Delete snapshot").click({ force: true });

      cy.contains("Deleted snapshot");
      cy.contains("No items found");
    });
  })
});
