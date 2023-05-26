/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IM_PLUGIN_NAME, BASE_PATH, BACKEND_BASE_PATH } from "../../../utils/constants";

const ActionTypeName = {
  reindex: "indices:data/write/reindex",
  resize: "indices:admin/resize",
  forcemerge: "indices:admin/forcemerge",
  open: "indices:admin/open",
};

const channel = "test_for_cypress";

const clearLRONConfig = () => {
  Object.values(ActionTypeName).forEach((actionTypeName) => {
    cy.request({
      method: "PUT",
      url: `${BACKEND_BASE_PATH}/_plugins/_im/lron/${encodeURIComponent(`LRON:${actionTypeName}`)}`,
      body: {
        lron_config: {
          lron_condition: {
            success: false,
            failure: false,
          },
          action_name: actionTypeName,
          channels: [],
        },
      },
    });
  });
};

const allAction = Object.values(ActionTypeName);

const clearChannel = () => {
  cy.request({
    method: "DELETE",
    url: `${BACKEND_BASE_PATH}/_plugins/_notifications/configs/test_for_cypress`,
    failOnStatusCode: false,
  });
};

describe("NotificationSettings", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    clearLRONConfig();
    clearChannel();
    cy.request({
      method: "POST",
      url: `${BACKEND_BASE_PATH}/_plugins/_notifications/configs/`,
      body: {
        config_id: "test_for_cypress",
        name: channel,
        config: {
          name: channel,
          description: channel,
          config_type: "slack",
          is_enabled: true,
          slack: {
            url: "https://sample-slack-webhook",
          },
        },
      },
    });
  });

  beforeEach(() => {
    // Visit ISM OSD
    cy.visit(`${BASE_PATH}/app/${IM_PLUGIN_NAME}#/notifications`);

    // Common text to wait for to confirm page loaded, give up to 60 seconds for initial load
    cy.contains("Defaults for index operations", { timeout: 60000 });
  });

  describe("Display all with empty", () => {
    it("successfully", () => {
      allAction.forEach((item, index) => {
        cy.get(`[data-test-subj="dataSource.${index}.channels"]`).should("not.exist");
      });
    });
  });

  describe("Set one to notify", () => {
    it("successfully", () => {
      cy.get(`[data-test-subj="dataSource.0.failure"]`).check({
        force: true,
      });
      cy.get(`[data-test-subj="dataSource.0.channels"] [data-test-subj="comboBoxSearchInput"]`).type(`${channel}{enter}`);
      cy.get('[data-test-subj="submitNotifcationSettings"]').click({
        force: true,
      });
      cy.contains("Notifications settings for index operations have been successfully updated.");
      cy.reload();
      cy.contains(channel);
      cy.get(`[data-test-subj="dataSource.0.failure"]`).should("be.checked");
    });
  });

  after(() => {
    clearLRONConfig();
    clearChannel();
  });
});
