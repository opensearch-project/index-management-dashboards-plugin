/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { PLUGIN_NAME } from "../support/constants";
import sampleTransform from "../fixtures/sample_transform";

const TRANSFORM_ID = "test_transform_id";

describe("Transforms", () => {
    beforeEach(() => {
      // Set welcome screen tracking to test_transform_target
      localStorage.setItem("home:welcome:show", true);

      // Go to sample data page_size
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/home#/tutorial_directory/sampleData`);

      // Click on "Sample data" tab
      cy.contains("Sample data", { timeout: 20000 }).click({ force: true });
      // Load sample eCommerce data
      cy.get(`button[data-test-subj="addSampleDataSetecommerce"]`).click({ force: true });

      // Verify that sample data is add by checking toast notification
      cy.contains("Sample eCommerce orders installed", { timeout: 60000 });

      // Visit ISM Transforms Dashboard
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/transforms`);

      // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
      cy.contains("Create transform", { timeout: 60000 });
    });

    describe("can be created", () => {
      before(() => {
        cy.deleteAllIndices();
      });

      it("successfully", () => {
        // Confirm we loaded empty state
        cy.contains(
          "Transform jobs help you create a materialized view on top of existing data."
        );

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
          .type("target_index{enter}");

        // Click the next button
        cy.get("button").contains("Next").click({ force: true });

        // Confirm that we got to step 2 of creation page
        cy.contains("Select fields to transform");

        // Setup Group and aggregation
        cy.wait(2000);
        cy.contains("category.keyword").parent().parent().parent().next()
          .children().first().children().first().children().first()
          .click({ force: true });

        cy.contains("Group by terms").click({ force: true });

        // Confirm group was added
        cy.contains("category.keyword_terms");

        // Add aggregable field
        cy.contains("50 columns hidden").click({ force: true });
        cy.contains("taxless_total_price").click({ force: true });
        // Click out of the window
        cy.contains("Select fields to transform").click({ force: true });

        cy.contains("taxless_total_price").parent().parent().parent().next()
          .children().first().children().first().children().first()
          .click({ force: true });
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
        cy.contains(`${TRANSFORM_ID}`);
      });
    });

    describe("can be edited", () => {
      before(() => {
        cy.deleteAllIndices();
        cy.createTransform(TRANSFORM_ID, sampleTransform);
      });

      it("successfully", () => {
        // Confirm we have our initial transform
        cy.contains(TRANSFORM_ID);

        // Select checkbox for our transform
        cy.get(`#_selection_column_${TRANSFORM_ID}-checkbox`)
          .check({ force: true });

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
      before(() => {
        cy.deleteAllIndices();
        cy.createTransform(TRANSFORM_ID, sampleTransform);
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
        cy.contains(
          "Transform jobs help you create a materialized view on top of existing data."
        );
      });
    });

    describe("can be enabled and disabled", () => {
      before(() => {
        cy.deleteAllIndices();
        cy.createTransform(TRANSFORM_ID, sampleTransform);
      });

      it("successfully", () => {
        // Confirm we have our initial transform
        cy.contains(TRANSFORM_ID);

        // Click into transform job details page
        cy.get(`[data-test-subj="transformLink_${TRANSFORM_ID}"]`).click({ force: true });

        cy.contains(`${TRANSFORM_ID}`);

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
    })
});
