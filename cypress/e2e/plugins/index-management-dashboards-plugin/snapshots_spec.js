/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable cypress/no-unnecessary-waiting */

import { IM_PLUGIN_NAME, BASE_PATH } from "../../../utils/constants";

describe("Snapshots", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM Snapshots Dashboard
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/snapshots`);

    // Common text to wait for to confirm page loaded, give up to 120 seconds for initial load
    cy.contains("Restore", { timeout: 120000 });
  });

  describe("Repository can be created", () => {
    it("successfully creates a new repository", () => {
      // Create repository to store snapshots
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/repositories`);

      // Route to create repository page
      cy.contains("Create repository").click();

      // Type in repository name
      cy.get(`input[data-test-subj="repoNameInput"]`).focus().type("test_repo");

      // Type in repository location
      cy.get(`input[placeholder="e.g., /mnt/snapshots"]`).focus().type("~/Desktop");

      // if a toast message pops up then dismiss it
      cy.dismissToast();

      // Click Add button
      cy.get("button").contains("Add").click();

      // Confirm repository created
      cy.contains("test_repo");
    });
  });

  describe("Snapshot can be created", () => {
    it("successfully creates a new snapshot", () => {
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/snapshots`);

      // delete any existing indices
      cy.deleteAllIndices();

      // create test indices
      cy.createIndex("test_index_1");
      cy.createIndex("test_index_2");
      cy.createIndex("test_index_3");

      // Click Take snapshot button with a 12sec timeout
      cy.get(`[data-test-subj="takeSnapshotButton"]`, { timeout: 12000 })
        .should("be.visible")
        .should("not.be.disabled")
        .contains("Take snapshot")
        .click();

      // Confirm test_repo exists and is in the Select repo field
      cy.contains("test_repo");

      // Type in Snapshot name
      cy.get(`input[data-test-subj="snapshotNameInput"]`).type("test_snapshot{enter}");

      // Select all indexes to be included
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_1{enter}");
      cy.wait(1000);
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_2{enter}");
      cy.wait(1000);
      cy.get(`[data-test-subj="indicesComboBoxInput"]`).type("test_index_3{enter}");
      cy.wait(1000);

      // if a toast message pops up then dismiss it
      cy.dismissToast();

      // Click 'Add' button to create snapshot
      cy.get(`[data-test-subj="flyout-footer-action-button"]`).contains("Add", { timeout: 3000 }).click();

      // check for success status and snapshot name
      cy.get("button").contains("Refresh").click();

      cy.contains("Success");

      // remove all indices
      cy.deleteAllIndices();
    });
  });

  describe("Snapshot can be restored", () => {
    it("Successfully restores indexes from snapshot", () => {
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/snapshots`);
      // Wait for snapshot to be created successfully with a 12sec timeout
      cy.get(`[data-test-subj="refreshButton"]`, { timeout: 12000 })
        .should("be.visible")
        .should("not.be.disabled")
        .contains("Refresh")
        .click();

      // Select test snapshot with a 2sec timeout
      cy.get(`[data-test-subj="checkboxSelectRow-test_repo:test_snapshot"]`, { timeout: 2000 }).check();

      // click "Restore" button
      cy.get(`[data-test-subj="restoreButton"]`).should("be.visible").should("not.be.disabled").click();

      // if a toast message pops up then dismiss it
      cy.dismissToast();

      // Check for restore flyout
      cy.contains("Restore snapshot");

      // enter a prefix
      cy.get(`input[data-test-subj="prefixInput"]`).type("restored_");

      // Click restore snapshot button
      cy.get(`[data-test-subj="flyout-footer-action-button"]`).contains("Restore snapshot").click();

      // Check for success toast
      cy.contains(`Restore from snapshot "test_snapshot" is in progress.`);
    });
  });

  describe("Snapshot can be deleted", () => {
    it("deletes snapshot successfully", () => {
      cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/snapshots`);
      // Select test snapshot
      cy.get(`[data-test-subj="checkboxSelectRow-test_repo:test_snapshot"]`).check();

      // click "Delete" button
      cy.get(`[data-test-subj="deleteButton"]`)
        .should("be.visible")
        .should("not.be.disabled")
        .get("button")
        .contains("Delete", { timeout: 3000 })
        .click();

      // click "Delete snapshot" button on modal with a 2sec timeout
      cy.get("button", { timeout: 2000 }).contains("Delete snapshot").click();

      cy.contains("Deleted snapshot");
      cy.contains("No items found");
    });
  });
});
