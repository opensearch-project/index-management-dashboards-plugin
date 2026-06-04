/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH, IM_PLUGIN_NAME } from "../../../utils/constants";
import samplePolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_policy";
import sampleRolloverPolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_rollover_policy";
import sampleDataStreamPolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_data_stream_policy.json";

const POLICY_ID = "test_policy_id";
const POLICY_ID_2 = "test_policy_id_2";
const POLICY_ID_ROLLOVER = "test_policy_rollover";
const SAMPLE_INDEX = "sample_index";
const SAMPLE_INDEX_ROLLOVER = "sample_index-01";

describe("Managed indexes", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    // Disable jitter so ISM jobs run without an additional delay
    cy.disableJitter();

    cy.wait(3000);

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/managed-indices`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Edit rollover alias", { timeout: 60000 });

    cy.dismissToast();
  });

  describe("can have policies removed", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createIndex(SAMPLE_INDEX, POLICY_ID);
    });

    it("successfully", () => {
      // Confirm we have initial policy
      cy.contains(POLICY_ID);

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      // Click Remove policy button
      cy.get(`[data-test-subj="Remove policyButton"]`).click({ force: true });

      // Click confirmation modal button
      cy.get(`[data-test-subj="confirmationModalActionButton"]`).click({
        force: true,
      });

      // Confirm we got a remove policy toaster
      cy.contains("Removed policy from 1 managed indexes");

      // Wait some time for remove policy to execute before reload
      cy.wait(3000).reload();

      // Confirm we are back to empty loading state, give 20 seconds as OSD takes a while to load
      cy.contains("There are no existing managed indexes.", { timeout: 20000 });
    });
  });

  describe("can have policies retried", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      // Create a policy that rolls over
      cy.createPolicy(POLICY_ID_ROLLOVER, sampleRolloverPolicy);
      // Create index with alias to rollover
      cy.createIndex(SAMPLE_INDEX_ROLLOVER, POLICY_ID_ROLLOVER, {
        aliases: { "retry-rollover-alias": {} },
      });
    });

    it("successfully", () => {
      // Confirm we have initial policy
      cy.contains(POLICY_ID_ROLLOVER);

      // Speed up execution time to happen in a few seconds
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX_ROLLOVER);

      // Wait up to 5 seconds for the managed index to execute
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();
      cy.dismissToast();

      // Confirm managed index successfully initialized the policy
      cy.contains("Successfully initialized", { timeout: 20000 });

      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX_ROLLOVER);

      // Wait up to 5 seconds for managed index to execute
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();
      cy.dismissToast();

      // Confirm we have a Failed execution, wait up to 20 seconds as OSD takes a while to load
      cy.contains("Failed", { timeout: 20000 });
      cy.contains("Missing rollover_alias");

      // Add rollover alias
      cy.updateIndexSettings(SAMPLE_INDEX_ROLLOVER, {
        "plugins.index_state_management.rollover_alias": "retry-rollover-alias",
      });

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX_ROLLOVER}"]`).check({ force: true });

      // Click the retry policy button
      cy.get(`[data-test-subj="Retry policyButton"]`).click({ force: true });

      // Click the retry modal button
      cy.get(`[data-test-subj="retryModalRetryButton"]`).click({ force: true });

      // Confirm we got retry toaster
      cy.contains("Retried 1 managed indexes");

      // Reload the page
      cy.reload();
      cy.dismissToast();

      // Confirm we see managed index attempting to retry, give 20 seconds for OSD load
      cy.contains("Pending retry of failed managed index", { timeout: 20000 });

      // Speed up next execution of managed index
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX_ROLLOVER);

      // Wait up to 5 seconds for managed index to execute
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();
      cy.dismissToast();

      // Confirm managed index successfully rolled over
      cy.contains("Successfully rolled over", { timeout: 20000 });
    });
  });

  describe("can edit rollover_alias", () => {
    const FIRST_ALIAS = "FIRST";
    const SECOND_ALIAS = "SECOND";

    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
      // Create index with rollover_alias
      cy.createIndex(SAMPLE_INDEX, POLICY_ID, {
        settings: {
          plugins: { index_state_management: { rollover_alias: FIRST_ALIAS } },
        },
      });
    });

    it("successfully", () => {
      // Confirm we have initial policy loaded
      cy.contains(POLICY_ID);

      // Get current index settings for index
      cy.getIndexSettings(SAMPLE_INDEX).then((res) => {
        // Confirm the current rollover_alias is the first one we set
        expect(res.body).to.have.nested.property("sample_index.settings.index.plugins.index_state_management.rollover_alias", FIRST_ALIAS);
      });

      // Select checkbox for our managed index
      cy.get(`[data-test-subj="checkboxSelectRow-${SAMPLE_INDEX}"]`).check({
        force: true,
      });

      // Click edit rollover alias button
      cy.get(`[data-test-subj="Edit rollover aliasButton"]`).click({
        force: true,
      });

      // Type in second rollover alias in input
      cy.get(`input[placeholder="Rollover alias"]`).focus().type(SECOND_ALIAS);

      // Click rollover alias modal confirmation button
      cy.get(`[data-test-subj="editRolloverAliasModalAddButton"]`).click({
        force: true,
      });

      // Confirm we got rollover alias toaster
      cy.contains("Edited rollover alias on sample_index");

      // Get updated index settings for index
      cy.getIndexSettings(SAMPLE_INDEX).then((res) => {
        // Confirm the rollover_alias setting is set to second alias
        expect(res.body).to.have.nested.property("sample_index.settings.index.plugins.index_state_management.rollover_alias", SECOND_ALIAS);
      });
    });
  });

  describe("can change policies", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createPolicy(POLICY_ID_2, samplePolicy);
      cy.createIndex(SAMPLE_INDEX, POLICY_ID);
    });

    it("successfully", () => {
      // Confirm we have our initial policy loaded
      cy.contains(POLICY_ID);

      // Click the change policy button to move to new page
      cy.get(`[data-test-subj="changePolicyButton"]`).click({ force: true });

      // Get the first combo search input box which should be index input
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`)
        .first()
        .focus()
        .type(SAMPLE_INDEX, { parseSpecialCharSequences: false, delay: 1 });

      // Click the index option
      cy.get(`button[title="${SAMPLE_INDEX}"]`).trigger("click", {
        force: true,
      });

      // Get the third combo search input box which should be the policy input
      cy.get(`input[data-test-subj="comboBoxSearchInput"]`).eq(2).focus().type(POLICY_ID_2, { parseSpecialCharSequences: false, delay: 1 });

      // Click the policy option
      cy.get(`button[title="${POLICY_ID_2}"]`).click({ force: true });

      // Click the Change Policy button
      cy.get(`[data-test-subj="changePolicyChangeButton"]`).click({
        force: true,
      });

      // Confirm we got the change policy toaster
      cy.contains("Changed policy on 1 indexes");

      // Click back to Managed Indices page by clicking "Managed indices" breadcrumb
      cy.contains("Policy managed indexes").click();

      // Speed up execution of managed index
      cy.updateManagedIndexConfigStartTime(SAMPLE_INDEX);

      // Wait 5 seconds for next execution and then reload page
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000).reload();

      // Confirm we have successfully initialized the policy
      cy.contains("Successfully initialized");
      // Confirm the policy initialized was the second policy we changed to
      cy.contains(POLICY_ID_2);
    });
  });

  describe("can manage data stream indexes", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.deleteDataStreams("*");

      cy.createPolicy("sample-index-policy", samplePolicy);
      cy.createPolicy("sample-data-stream-policy", sampleDataStreamPolicy);

      cy.createIndexTemplate("logs-template", {
        index_patterns: ["logs-*"],
        data_stream: {},
      });

      cy.createIndex("index-1", "sample-index-policy");
      cy.createIndex("index-2", "sample-index-policy");
      cy.createDataStream("logs-nginx");
      cy.createDataStream("logs-haproxy");
      cy.createDataStream("logs-redis");
      cy.rollover("logs-redis");
    });

    it("successfully", () => {
      // Confirm regular indices are shown, but data stream indices are not shown.
      cy.contains("index-1");
      cy.contains(".ds-logs-nginx-000001").should("not.exist");
      cy.contains(".ds-logs-haproxy-000001").should("not.exist");

      // Confirm that "Show data stream indices" toggle switch works.
      cy.get(`[data-test-subj="toggleShowDataStreams"]`).click({ force: true });
      cy.contains(".ds-logs-nginx-000001");
      cy.contains(".ds-logs-haproxy-000001");

      // Confirm that data streams can be selected from dropdown.
      cy.get(`span[data-text="Data streams"]`).first().click({ force: true });
      cy.get(".euiFilterSelect__items").should(($tr) => {
        expect($tr, "item").to.contain("logs-nginx");
        expect($tr, "item").to.contain("logs-haproxy");
        expect($tr, "item").to.contain("logs-redis");
      });

      // Select data streams from the list.
      cy.get(".euiFilterSelect__items").contains("logs-redis").click({ force: true });
      cy.get(`span[data-text="Data streams"]`).first().click({ force: true });
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "2 rows").to.have.length(2);
        expect($tr, "item").to.contain(".ds-logs-redis-000001");
        expect($tr, "item").to.contain(".ds-logs-redis-000002");
      });

      // Confirm that "Edit rollover alias" button remains disabled for a data stream backing index.
      cy.get(`[data-test-subj="checkboxSelectRow-.ds-logs-redis-000001"]`).check({ force: true });
      cy.get(`[data-test-subj="Edit rollover aliasButton"]`).should("be.disabled");
    });
  });
});
