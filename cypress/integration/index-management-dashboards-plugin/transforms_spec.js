/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from "../support/constants";
import sampleTransform from "../fixtures/sample_transform";

const TRANSFORM_ID = "test_transform_id";

describe("Transforms", () => {
  before(() => {
    // Delete all indices
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
  });

  beforeEach(() => {
    // delete test transform and index
    cy.request("DELETE", `${Cypress.env("opensearch")}/test_transform*`);
    cy.request({
      method: "POST",
      url: `${Cypress.env("opensearch")}/_plugins/_transform/${TRANSFORM_ID}/_stop`,
      failOnStatusCode: false,
    });
    cy.request({
      method: "DELETE",
      url: `${Cypress.env("opensearch")}/_plugins/_transform/${TRANSFORM_ID}  `,
      failOnStatusCode: false,
    });

    // Set welcome screen tracking to test_transform_target
    localStorage.setItem("home:welcome:show", true);

    // Visit ISM Transforms Dashboard
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/transforms`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Create transform", { timeout: 60000 });
  });

  describe("can be created", () => {
    it("successfully", () => {
      // Confirm we loaded empty state
      cy.contains("Transform jobs help you create a materialized view on top of existing data.");

      // Route to create transform page
      cy.contains("Create transform").click({ force: true });

      // Type in transform ID
      cy.get(`input[placeholder="my-transformjob1"]`).type(TRANSFORM_ID, { force: true });

      // Get description input box
      cy.get(`textarea[data-test-subj="description"]`).focus().type("some description");

      // Enter source index
      cy.get(`div[data-test-subj="sourceIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type("opensearch_dashboards_sample_data_ecommerce{enter}");

      // Enter target index
      cy.get(`div[data-test-subj="targetIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type("test_transform{enter}");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 2 of creation page
      cy.contains("Select fields to transform");

      cy.get(`button[data-test-subj="category.keywordOptionsPopover"]`).click({ force: true });

      cy.contains("Group by terms").click({ force: true });

      // Confirm group was added
      cy.contains("category.keyword_terms");

      // Add aggregable field
      cy.contains("50 columns hidden").click({ force: true });
      cy.contains("taxless_total_price").click({ force: true });
      // Click out of the window
      cy.contains("Select fields to transform").click({ force: true });

      cy.get(`button[data-test-subj="taxless_total_priceOptionsPopover"]`).click({ force: true });

      cy.contains("Aggregate by avg").click({ force: true });

      // Confirm agg was added
      cy.contains("avg_taxless_total_price");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 3 of creation page
      cy.contains("Job enabled by default");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 4 of creation page
      cy.contains("Review and create");

      // Click the create button
      cy.get("button").contains("Create").click({ force: true });

      // Verify that sample data is add by checking toast notification
      cy.contains(`Transform job "${TRANSFORM_ID}" successfully created.`);
      cy.location("hash").should("contain", "transforms");
      cy.get(`button[data-test-subj="transformLink_${TRANSFORM_ID}"]`);
    });
  });

  describe("can be edited", () => {
    beforeEach(() => {
      cy.createTransform(TRANSFORM_ID, sampleTransform);
      cy.reload();
    });

    it("successfully", () => {
      // Confirm we have our initial transform
      cy.contains(TRANSFORM_ID);

      // Select checkbox for our transform
      cy.get(`#_selection_column_${TRANSFORM_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Edit button
      cy.get(`[data-test-subj="editButton"]`).click({ force: true });

      // Wait for initial transform job to load
      cy.contains("Test transform");

      cy.get(`textArea[data-test-subj="description"]`).focus().clear().type("A new description");

      // Click Save changes button
      cy.get(`[data-test-subj="editTransformSaveButton"]`).click({ force: true });

      // Confirm we get toaster saying changes saved
      cy.contains(`Changes to transform saved`);

      // Click into transform job details page
      cy.get(`[data-test-subj="transformLink_${TRANSFORM_ID}"]`).click({ force: true });

      // Confirm new description shows in details page
      cy.contains("A new description");
    });
  });

  describe("can be deleted", () => {
    beforeEach(() => {
      cy.createTransform(TRANSFORM_ID, sampleTransform);
      cy.reload();
    });

    it("successfully", () => {
      // Confirm we have our initial transform
      cy.contains(TRANSFORM_ID);

      // Disable transform
      cy.get(`#_selection_column_${TRANSFORM_ID}-checkbox`).check({ force: true });
      cy.get(`[data-test-subj="disableButton"]`).click({ force: true });
      cy.contains(`"${TRANSFORM_ID}" is disabled`);

      // Select checkbox for our transform job
      cy.get(`#_selection_column_${TRANSFORM_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Delete button
      cy.get(`[data-test-subj="deleteButton"]`).click({ force: true });

      // Type "delete" to confirm deletion
      cy.get(`input[placeholder="delete"]`).type("delete", { force: true });

      // Click the delete confirmation button in modal
      cy.get(`[data-test-subj="confirmModalConfirmButton"]`).click();

      // Confirm we got deleted toaster
      cy.contains(`"${TRANSFORM_ID}" successfully deleted`);

      // Confirm showing empty loading state
      cy.contains("Transform jobs help you create a materialized view on top of existing data.");
    });
  });

  describe("can be enabled and disabled", () => {
    beforeEach(() => {
      cy.createTransform(TRANSFORM_ID, sampleTransform);
      cy.reload();
    });

    it("successfully", () => {
      // Confirm we have our initial transform
      cy.contains(TRANSFORM_ID);

      // Click into transform job details page
      cy.get(`[data-test-subj="transformLink_${TRANSFORM_ID}"]`).click({ force: true });

      cy.contains(`${TRANSFORM_ID}`);

      /* Wait required for page data to load, otherwise "Disable" button will
       * appear greyed out and unavailable. Cypress automatically retries,
       * but only after menu is open, doesn't re-render.
       */
      cy.wait(1000);

      // Click into Actions menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Disable button
      cy.get(`[data-test-subj="disableButton"]`).click();

      // Confirm we get toaster saying transform job is disabled
      cy.contains(`"${TRANSFORM_ID}" is disabled`);

      cy.wait(1000);

      // Click into Actions menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Enable button
      cy.get(`[data-test-subj="enableButton"]`).click({ force: true });

      // Confirm we get toaster saying transform job is enabled
      cy.contains(`"${TRANSFORM_ID}" is enabled`);
    });
  });

  describe("can be created in continuous mode", () => {
    it("successfully", () => {
      // Confirm we loaded empty state
      cy.contains("Transform jobs help you create a materialized view on top of existing data.");

      // Route to create transform page
      cy.contains("Create transform").click({ force: true });

      // Type in transform ID
      cy.get(`input[placeholder="my-transformjob1"]`).type(TRANSFORM_ID, { force: true });

      // Get description input box
      cy.get(`textarea[data-test-subj="description"]`).focus().type("some description");

      // Enter source index
      cy.get(`div[data-test-subj="sourceIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type("opensearch_dashboards_sample_data_ecommerce{enter}");

      // Enter target index
      cy.get(`div[data-test-subj="targetIndexCombobox"]`)
        .find(`input[data-test-subj="comboBoxSearchInput"]`)
        .focus()
        .type("test_transform{enter}");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 2 of creation page
      cy.contains("Select fields to transform");

      cy.get(`button[data-test-subj="category.keywordOptionsPopover"]`).click({ force: true });

      cy.contains("Group by terms").click({ force: true });

      // Confirm group was added
      cy.contains("category.keyword_terms");

      // Add aggregable field
      cy.contains("50 columns hidden").click({ force: true });
      cy.contains("taxless_total_price").click({ force: true });
      // Click out of the window
      cy.contains("Select fields to transform").click({ force: true });

      cy.get(`button[data-test-subj="taxless_total_priceOptionsPopover"]`).click({ force: true });

      cy.contains("Aggregate by avg").click({ force: true });

      // Confirm agg was added
      cy.contains("avg_taxless_total_price");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 3 of creation page
      cy.contains("Job enabled by default");

      // Make the transform continuous
      cy.get("[id=yes]").click({ force: true });

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 4 of creation page
      cy.contains("Review and create");

      // Confirm that the transform is continuous
      cy.contains("Continuous, every");

      // Click the create button
      cy.get("button").contains("Create").click({ force: true });

      // Verify that sample data is add by checking toast notification
      cy.contains(`Transform job "${TRANSFORM_ID}" successfully created.`);
      cy.location("hash").should("contain", "transforms");
      cy.get(`button[data-test-subj="transformLink_${TRANSFORM_ID}"]`);

      // The continuous column should say 'Yes'
      cy.contains("Yes");
    });
  });
});
