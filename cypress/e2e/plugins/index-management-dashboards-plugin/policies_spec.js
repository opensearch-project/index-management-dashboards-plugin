/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_PATH, IM_PLUGIN_NAME } from "../../../utils/constants";
import samplePolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_policy";
import sampleAliasPolicy from "../../../fixtures/plugins/index-management-dashboards-plugin/sample_policy_alias_action.json";

const POLICY_ID = "test_policy_id";

describe("Policies", () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");

    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Create policy", { timeout: 60000 });
  });

  describe("can be created", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
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
      cy.get(`input[placeholder="example_policy"]`).type(POLICY_ID, {
        force: true,
      });

      // Wait for default policy JSON to load
      cy.contains("A simple default policy");

      // Focus JSON input area, clear old policy and type in new policy
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.get(".ace_text-input").first().focus().clear().type(JSON.stringify(samplePolicy), {
        parseSpecialCharSequences: false,
        delay: 5,
        timeout: 20000,
      });

      // Click the create button
      cy.get("button").contains("Create").click({ force: true });

      // Confirm we got created toaster
      cy.contains(`Created policy: ${POLICY_ID}`);

      // Confirm we can see the created policy's description in table
      cy.contains("A simple description");
    });

    it("with an alias action using the visual editor", () => {
      /* Create a policy with an alias action */
      const aliasPolicyId = "visual-editor-alias-policy";
      const testInputs = {
        add: ["alias1", "alias2"],
        remove: ["alias3", "alias5", "alias6"],
      };
      const testIndexPattern = "test-index-pattern";

      // Route us to create policy page
      cy.contains("Create policy").click({ force: true });

      // Use the visual editor
      cy.contains("Visual editor").click({ force: true });
      cy.contains("Continue").click({ force: true });

      // Wait for input to load and then type in the policy ID
      cy.get(`input[placeholder="hot_cold_workflow"]`).type(aliasPolicyId, {
        force: true,
      });

      // Type in the policy description
      cy.get(`[data-test-subj="create-policy-description"]`).type("{selectall}{backspace}" + sampleAliasPolicy.policy.description);

      // Add an ISM template
      cy.get("button").contains("Add template").click({ force: true });

      // Enter an index pattern
      cy.get(`[data-test-subj="comboBoxInput"]`).type(testIndexPattern);

      // Add a state
      cy.get("button").contains("Add state").click({ force: true });

      // Enter a state name
      cy.get(`[data-test-subj="create-state-state-name"]`).type(sampleAliasPolicy.policy.states[0].name);

      // Add a new action
      cy.get("button").contains("+ Add action").click({ force: true });

      // Select 'Alias' type
      cy.get(`[data-test-subj="create-state-action-type"]`).select("Add / remove aliases");

      // Confirm 'Add action' button is disabled
      cy.get(`[data-test-subj="flyout-footer-action-button"]`).should("be.disabled");

      // Toggle the add alias combo box
      cy.get(`[data-test-subj="add-alias-toggle"]`).click({ force: true });

      // Enter aliases to add
      cy.get(`[data-test-subj="add-alias-combo-box"]`).click({ force: true }).type(testInputs.add.join("{enter}"));

      // Toggle the add alias combo box
      cy.get(`[data-test-subj="remove-alias-toggle"]`).click({ force: true });

      // Enter aliases to remove
      cy.get(`[data-test-subj="remove-alias-combo-box"]`).click({ force: true }).type(testInputs.remove.join("{enter}").concat("{enter}"));

      // Click the 'Add action' button
      cy.get(`[data-test-subj="flyout-footer-action-button"]`).click({ force: true });

      // Click the 'Save action' button
      cy.get("button").contains("Save state").click({ force: true });

      // Click the 'Create' button
      cy.get("button").contains("Create").click({ force: true });

      /* Confirm policy was created as expected */

      // Wait for the 'State management' dashboard to load
      cy.contains("State management policies (", { timeout: 60000 });

      // Click on the test alias to navigate to the details page
      cy.contains(aliasPolicyId).click({ force: true });

      // Wait for the details page to load, and click the 'Edit' button
      cy.url({ timeout: 60000 }).should("include", "policy-details");
      cy.contains("Edit").click({ force: true });

      // Use the visual editor
      cy.contains("Visual editor").click({ force: true });
      cy.contains("Continue").click({ force: true });

      // Click the state edit icon
      cy.get(`[aria-label="Edit"]`).click({ force: true });
      cy.get(`[data-test-subj="draggable"]`).within(() => {
        cy.get(`[aria-label="Edit"]`).click({ force: true });
      });

      // Confirm all of the expected inputs are in the 'Add' combo box
      testInputs.add.forEach((alias) => {
        cy.get(`[data-test-subj="add-alias-combo-box"]`).contains(alias);
      });

      // Confirm all of the expected inputs are in the 'Remove' combo box
      testInputs.remove.forEach((alias) => {
        cy.get(`[data-test-subj="remove-alias-combo-box"]`).contains(alias);
      });
    });
  });

  describe("can be edited", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
      cy.createPolicy(sampleAliasPolicy.policy.policy_id, sampleAliasPolicy);
    });

    it("successfully", () => {
      // Make changes to policy JSON for editing confirmation
      const newPolicy = {
        policy: { ...samplePolicy.policy, description: "A new description" },
      };

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
      cy.get(".ace_text-input").first().focus().clear().type(JSON.stringify(newPolicy), {
        parseSpecialCharSequences: false,
        delay: 5,
        timeout: 20000,
      });

      // Click Update button
      cy.get(`[data-test-subj="createPolicyCreateButton"]`).click({
        force: true,
      });

      // Confirm we get toaster saying updated
      cy.contains(`Updated policy: ${POLICY_ID}`);

      // Confirm new description shows in table
      cy.contains("A new description");
    });

    it("with more aliases", () => {
      // Click on the test alias to navigate to the details page
      const testInputs = {
        add: ["alias4", "alias6"],
        remove: ["alias1", "alias2", "alias7"],
      };
      /* Edit the policy */

      // Click on the test alias to navigate to the details page
      cy.contains(sampleAliasPolicy.policy.policy_id).click({ force: true });

      // Wait for the details page to load, and click the 'Edit' button
      cy.url({ timeout: 60000 }).should("include", "policy-details");
      cy.contains("Edit").click({ force: true });

      // Use the visual editor
      cy.contains("Visual editor").click({ force: true });
      cy.contains("Continue").click({ force: true });

      // Click the 'Edit state' icon
      cy.get(`[aria-label="Edit"]`).click({ force: true });

      // Click the 'Edit action' icon
      cy.get(`[data-test-subj="draggable"]`).within(() => {
        cy.get(`[aria-label="Edit"]`).click({ force: true });
      });

      // Remove an alias from the 'Add' combo box
      cy.get(`[aria-label="Remove alias5 from selection in this group"]`).click({ force: true });

      // Add a new alias to the 'Remove' combo box
      cy.get(`[data-test-subj="remove-alias-combo-box"]`).click({ force: true }).type("alias7{enter}");

      // Save the edits
      cy.get(`[data-test-subj="flyout-footer-action-button"]`).click({ force: true });
      cy.get("button").contains("Update state").click({ force: true });
      cy.get("button").contains("Update").click({ force: true });

      /* Confirm policy was edited as expected */

      // Wait for the 'State management' dashboard to load
      cy.contains("State management policies (", { timeout: 60000 });

      // Click on the test alias to navigate to the details page
      cy.contains(sampleAliasPolicy.policy.policy_id).click({ force: true });

      // Wait for the details page to load, and click the 'Edit' button
      cy.url({ timeout: 60000 }).should("include", "policy-details");
      cy.contains("Edit").click({ force: true });

      // Use the visual editor
      cy.contains("Visual editor").click({ force: true });
      cy.contains("Continue").click({ force: true });

      // Click the 'Edit state' icon
      cy.get(`[aria-label="Edit"]`).click({ force: true });

      // Click the 'Edit action' icon
      cy.get(`[data-test-subj="draggable"]`).within(() => {
        cy.get(`[aria-label="Edit"]`).click({ force: true });
      });

      // Confirm all of the expected inputs are in the 'Add' combo box
      testInputs.add.forEach((alias) => {
        cy.get(`[data-test-subj="add-alias-combo-box"]`).contains(alias);
      });

      // Confirm all of the expected inputs are in the 'Remove' combo box
      testInputs.remove.forEach((alias) => {
        cy.get(`[data-test-subj="remove-alias-combo-box"]`).contains(alias);
      });
    });
  });

  describe("can be deleted", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.deleteIMJobs();
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
      cy.deleteIMJobs();
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
      cy.deleteIMJobs();
      cy.createPolicy(POLICY_ID, samplePolicy);
    });

    it("successfully", () => {
      cy.contains(POLICY_ID);

      cy.get(`[data-test-subj="policyLink_${POLICY_ID}"]`).click({
        force: true,
      });

      cy.contains(POLICY_ID);
      cy.contains(samplePolicy.policy.description);
      samplePolicy.policy.states.forEach((state) => {
        cy.contains(state.name);
      });

      cy.get(`[data-test-subj="viewButton"]`).click({ force: true });
      cy.contains(`View JSON of ${POLICY_ID}`);
    });
  });
});
