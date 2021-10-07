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

/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { PLUGIN_NAME } from "../support/constants";
import sampleRollup from "../fixtures/sample_rollup";

const ROLLUP_ID = "test_rollup_id";

describe("Rollups", () => {
  beforeEach(() => {
    // Set welcome screen tracking to true
    localStorage.setItem("home:welcome:show", "true");

    // Go to sample data page
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/home#/tutorial_directory/sampleData`);

    // Click on "Sample data" tab
    cy.contains("Sample data").click({ force: true });
    // Load sample eCommerce data
    cy.get(`button[data-test-subj="addSampleDataSetecommerce"]`).click({ force: true });

    // Verify that sample data is add by checking toast notification
    cy.contains("Sample eCommerce orders installed", { timeout: 60000 });

    // Visit ISM OSD
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/rollups`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Create rollup", { timeout: 60000 });
  });

  describe("can be created", () => {
    before(() => {
      cy.deleteAllIndices();
    });

    it("successfully", () => {
      // Confirm we loaded empty state
      cy.contains(
        "Rollup jobs help you conserve storage space for historical time series data while preserving the specific information you need"
      );

      // Route us to create rollup page
      cy.contains("Create rollup").click({ force: true });

      // Type in the rollup ID
      cy.get(`input[placeholder="my-rollupjob1"]`).type(ROLLUP_ID, { force: true });

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
      cy.contains("Time aggregation");

      // Enter timestamp field
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).focus().type("order_date{enter}");

      // Add aggregation
      cy.get(`button[data-test-subj="addFieldsAggregationEmpty"]`).click({ force: true });

      // Select a few fields
      cy.get(`input[data-test-subj="checkboxSelectRow-customer_gender"]`).click({ force: true });
      cy.get(`input[data-test-subj="checkboxSelectRow-day_of_week_i"]`).click({ force: true });
      cy.get(`input[data-test-subj="checkboxSelectRow-geoip.city_name"]`).click({ force: true });

      // Click the Add button from add fields modal
      cy.get(`button[data-test-subj="addFieldsAggregationAdd"]`).click({ force: true });

      // Confirm fields are added
      cy.contains("customer_gender");
      cy.contains("day_of_week_i");
      cy.contains("geoip.city_name");

      // Add metrics
      cy.get(`button[data-test-subj="addFieldsMetricEmpty"]`).click({ force: true });

      // Select a few fields
      cy.get(`input[data-test-subj="checkboxSelectRow-products.taxless_price"]`).click({ force: true });
      cy.get(`input[data-test-subj="checkboxSelectRow-total_quantity"]`).click({ force: true });

      // Click the Add button from add fields modal
      cy.get(`button[data-test-subj="addFieldsMetricAdd"]`).click({ force: true });

      // Confirm fields are added
      cy.contains("products.taxless_price");
      cy.contains("total_quantity");

      cy.get(`input[data-test-subj="min-total_quantity"]`).click({ force: true });
      cy.get(`input[data-test-subj="max-total_quantity"]`).click({ force: true });
      cy.get(`input[data-test-subj="sum-total_quantity"]`).click({ force: true });
      cy.get(`input[data-test-subj="all-products.taxless_price"]`).click({ force: true });

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 3 of creation page
      cy.contains("Enable job by default");

      // Click the next button
      cy.get("button").contains("Next").click({ force: true });

      // Confirm that we got to step 4 of creation page
      cy.contains("Job name and indices");

      // Click the create button
      cy.get("button").contains("Create").click({ force: true });

      // Verify that sample data is add by checking toast notification
      cy.contains(`Created rollup: ${ROLLUP_ID}`);
    });
  });

  describe("can be edited", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it("successfully", () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Select checkbox for our rollup job
      cy.get(`#_selection_column_${ROLLUP_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Edit button
      cy.get(`[data-test-subj="editButton"]`).click({ force: true });

      // Wait for initial rollup job to load
      cy.contains("An example rollup job that rolls up the sample ecommerce data");

      cy.get(`textArea[data-test-subj="description"]`).focus().clear().type("A new description");

      // Click Save changes button
      cy.get(`[data-test-subj="editRollupSaveChangesButton"]`).click({ force: true });

      // Confirm we get toaster saying changes saved
      cy.contains(`Changes to "${ROLLUP_ID}" saved!`);

      // Click into rollup job details page
      cy.get(`[data-test-subj="rollupLink_${ROLLUP_ID}"]`).click({ force: true });

      // Confirm new description shows in details page
      cy.contains("A new description");
    });
  });

  describe("can be deleted", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it("successfully", () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Select checkbox for our rollup job
      cy.get(`#_selection_column_${ROLLUP_ID}-checkbox`).check({ force: true });

      // Click on Actions popover menu
      cy.get(`[data-test-subj="actionButton"]`).click({ force: true });

      // Click Delete button
      cy.get(`[data-test-subj="deleteButton"]`).click({ force: true });

      // Type "delete" to confirm deletion
      cy.get(`input[placeholder="delete"]`).type("delete", { force: true });

      // Click the delete confirmation button in modal
      cy.get(`[data-test-subj="confirmModalConfirmButton"]`).click();

      // Confirm we got deleted toaster
      cy.contains(`"${ROLLUP_ID}" successfully deleted!`);

      // Confirm showing empty loading state
      cy.contains(
        "Rollup jobs help you conserve storage space for historical time series data while preserving the specific information you need"
      );
    });
  });

  describe("can be enabled and disabled", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createRollup(ROLLUP_ID, sampleRollup);
    });

    it("successfully", () => {
      // Confirm we have our initial rollup
      cy.contains(ROLLUP_ID);

      // Click into rollup job details page
      cy.get(`[data-test-subj="rollupLink_${ROLLUP_ID}"]`).click({ force: true });

      cy.contains(`${ROLLUP_ID}`);

      // Disable button is enabled
      cy.get(`[data-test-subj="disableButton"]`).should("not.be.disabled");

      // Click Disable button
      cy.get(`[data-test-subj="disableButton"]`).trigger("click", { force: true });

      // Confirm we get toaster saying rollup job is disabled
      cy.contains(`${ROLLUP_ID} is disabled`);

      // Click Enable button
      cy.get(`[data-test-subj="enableButton"]`).trigger("click", { force: true });

      // Confirm we get toaster saying rollup job is enabled
      cy.contains(`${ROLLUP_ID} is enabled`);
    });
  });
});
