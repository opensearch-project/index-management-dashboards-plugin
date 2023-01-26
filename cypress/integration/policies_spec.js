/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from "../support/constants";
import samplePolicy from "../fixtures/sample_policy";

const POLICY_ID = "test_policy_id";

describe("Policies", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM OSD
    cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Create policy", { timeout: 60000 });
  });

  describe("can be created", () => {
    before(() => {
      cy.deleteAllIndices();
    });

    it("successfully", () => {
      // Confirm we loaded empty state
      cy.contains("There are no existing policies");

      // Route us to create policy page
      cy.contains("Create policy").click({ force: true });

      // Route us to create policy page
      cy.contains("JSON editor").click({ force: true });

      // Route us to create policy page
      cy.contains("Continue").click({ force: true });

      // Wait for input to load and then type in the policy ID
      cy.get(`input[placeholder="example_policy"]`).type(POLICY_ID, { force: true });

      // Wait for default policy JSON to load
      cy.contains("A simple default policy");

      // Focus JSON input area, clear old policy and type in new policy
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(".ace_text-input")
        .first()
        .focus()
        .clear()
        .type(JSON.stringify(samplePolicy), { parseSpecialCharSequences: false, delay: 5, timeout: 20000 });

      // Click the create button
      cy.get("button").contains("Create").click({ force: true });

      // Confirm we got created toaster
      cy.contains(`Created policy: ${POLICY_ID}`);

      // Confirm we can see the created policy's description in table
      cy.contains("A simple description");
    });
  });

  describe("can be edited", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
    });

    it("successfully", () => {
      // Make changes to policy JSON for editing confirmation
      const newPolicy = { policy: { ...samplePolicy.policy, description: "A new description" } };

      // Confirm we have our initial policy
      cy.contains("A simple description");

      // Select checkbox for our policy
      cy.get(`#_selection_column_${POLICY_ID}-checkbox`).check({ force: true });

      // Click Edit button
      cy.get(`[data-test-subj="EditButton"]`).click({ force: true });

      // Route us to edit policy page
      cy.contains("JSON editor").click({ force: true });

      // Route us to edit policy page
      cy.contains("Continue").click({ force: true });

      // Wait for initial policy JSON to load
      cy.contains("A simple description");

      // Focus JSON input area, clear old policy and type in new policy
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(".ace_text-input")
        .first()
        .focus()
        .clear()
        .type(JSON.stringify(newPolicy), { parseSpecialCharSequences: false, delay: 5, timeout: 20000 });

      // Click Update button
      cy.get(`[data-test-subj="createPolicyCreateButton"]`).click({ force: true });

      // Confirm we get toaster saying updated
      cy.contains(`Updated policy: ${POLICY_ID}`);

      // Confirm new description shows in table
      cy.contains("A new description");
    });
  });

  describe("can be deleted", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
    });

    it("successfully", () => {
      // Confirm we have our initial policy
      cy.contains("A simple description");

      // Select checkbox for our policy
      cy.get(`#_selection_column_${POLICY_ID}-checkbox`).check({ force: true });

      // Click Delete button
      cy.get(`[data-test-subj="DeleteButton"]`).click({ force: true });

      // Click the delete confirmation button in modal
      cy.get(`[data-test-subj="confirmationModalActionButton"]`).click();

      // Confirm we got deleted toaster
      cy.contains(`Deleted the policy: ${POLICY_ID}`);

      // Confirm showing empty loading state
      cy.contains("There are no existing policies.");
    });
  });

  describe("can be searched", () => {
    before(() => {
      cy.deleteAllIndices();
      // Create 20+ policies that can be easily sorted alphabetically using letters a-z
      for (let i = 97; i < 123; i++) {
        const char = String.fromCharCode(i);
        cy.createPolicy(`${POLICY_ID}_${char}`, samplePolicy);
      }
    });

    it("successfully", () => {
      // Confirm we have our initial policy
      cy.contains("A simple description");

      // Sort the table by policy name
      cy.get("thead > tr > th").contains("Policy").click({ force: true });

      // Confirm the last "_z" policy does not exist
      cy.contains(`${POLICY_ID}_z`).should("not.exist");

      // Type in policy name in search box
      cy.get(`input[type="search"]`).focus().type(`${POLICY_ID}_z`);

      // Confirm we filtered down to our one and only policy
      cy.get("tbody > tr").should(($tr) => {
        expect($tr, "1 row").to.have.length(1);
        expect($tr, "item").to.contain(`${POLICY_ID}_z`);
      });
    });
  });

  describe("can be viewed", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createPolicy(POLICY_ID, samplePolicy);
    });

    it("successfully", () => {
      cy.contains(POLICY_ID);

      cy.get(`[data-test-subj="policyLink_${POLICY_ID}"]`).click({ force: true });

      cy.contains(POLICY_ID);
      cy.contains(samplePolicy.policy.description);
      samplePolicy.policy.states.forEach((state, i) => {
        cy.contains(state.name);
      });

      cy.get(`[data-test-subj="viewButton"]`).click({ force: true });
      cy.contains(`View JSON of ${POLICY_ID}`);
    });
  });
});
