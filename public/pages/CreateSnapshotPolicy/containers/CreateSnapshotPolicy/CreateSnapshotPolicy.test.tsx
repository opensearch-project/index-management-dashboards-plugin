/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter as Router, Redirect, Route, Switch, RouteComponentProps } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import CreateSnapshotPolicy from "./CreateSnapshotPolicy";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ROUTES } from "../../../../utils/constants";
import { ServicesConsumer, ServicesContext } from "../../../../services";
import { ModalProvider, ModalRoot } from "../../../../components/Modal";
import { CoreServicesConsumer, CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { BrowserServices } from "../../../../models/interfaces";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false),
  });
  (getApplication as jest.Mock).mockReturnValue({});
  (getNavigationUI as jest.Mock).mockReturnValue({});
});

function renderCreateSnapshotPolicyWithRouter(initialEntries = ["/"], isEdit = false) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <CoreServicesConsumer>
                    {(core: CoreStart | null) =>
                      core && (
                        <ModalProvider>
                          <ModalRoot services={services} />
                          <Switch>
                            <Route
                              path={ROUTES.CREATE_SNAPSHOT_POLICY}
                              render={(props: RouteComponentProps) => (
                                <CreateSnapshotPolicy 
                                  {...props} 
                                  isEdit={isEdit} 
                                  snapshotManagementService={services.snapshotManagementService}
                                  indexService={services.indexService}
                                  notificationService={services.notificationService}
                                />
                              )}
                            />
                            <Route
                              path="/edit-snapshot-policy"
                              render={(props: RouteComponentProps) => (
                                <CreateSnapshotPolicy 
                                  {...props} 
                                  isEdit={true} 
                                  snapshotManagementService={services.snapshotManagementService}
                                  indexService={services.indexService}
                                  notificationService={services.notificationService}
                                />
                              )}
                            />
                            <Route path={ROUTES.SNAPSHOT_POLICIES} render={() => <div>Testing Snapshot Policies</div>} />
                            <Redirect from="/" to={ROUTES.CREATE_SNAPSHOT_POLICY} />
                          </Switch>
                        </ModalProvider>
                      )
                    }
                  </CoreServicesConsumer>
                )
              }
            </ServicesConsumer>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<CreateSnapshotPolicy /> spec", () => {
  it("renders the component", async () => {
    const { container } = renderCreateSnapshotPolicyWithRouter();
    await waitFor(() => {});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("sets breadcrumbs when mounting", async () => {
    renderCreateSnapshotPolicyWithRouter();
    expect(coreServicesMock.chrome.setBreadcrumbs).toHaveBeenCalledTimes(1);
  });

  it("handles indices as array format when editing policy", async () => {
    // Mock the getPolicy response with indices as array
    browserServicesMock.snapshotManagementService.getPolicy = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        id: "test-policy",
        seqNo: 0,
        primaryTerm: 1,
        policy: {
          name: "test-policy",
          description: "Test policy",
          snapshot_config: {
            indices: ["index1", "index2", "index3"],
            repository: "test-repo"
          },
          creation: {
            schedule: {
              cron: {
                expression: "0 0 * * *",
                timezone: "UTC"
              }
            }
          },
          enabled: true
        }
      }
    });

    const { getByText } = renderCreateSnapshotPolicyWithRouter(["/edit-snapshot-policy?id=test-policy"], true);
    
    await waitFor(() => {
      // Wait for the policy to load without error
      expect(browserServicesMock.snapshotManagementService.getPolicy).toHaveBeenCalledWith("test-policy");
      // No error toasts should be shown
      expect(coreServicesMock.notifications.toasts.addDanger).not.toHaveBeenCalled();
    });
  });

  it("handles indices as string format when editing policy", async () => {
    // Mock the getPolicy response with indices as string 
    browserServicesMock.snapshotManagementService.getPolicy = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        id: "test-policy",
        seqNo: 0,
        primaryTerm: 1,
        policy: {
          name: "test-policy",
          description: "Test policy", 
          snapshot_config: {
            indices: "index1,index2,index3",
            repository: "test-repo"
          },
          creation: {
            schedule: {
              cron: {
                expression: "0 0 * * *",
                timezone: "UTC"
              }
            }
          },
          enabled: true
        }
      }
    });

    const { getByText } = renderCreateSnapshotPolicyWithRouter(["/edit-snapshot-policy?id=test-policy"], true);
    
    await waitFor(() => {
      expect(browserServicesMock.snapshotManagementService.getPolicy).toHaveBeenCalledWith("test-policy");
      expect(coreServicesMock.notifications.toasts.addDanger).not.toHaveBeenCalled();
    });
  });

  it("handles policy loading error gracefully", async () => {
    browserServicesMock.snapshotManagementService.getPolicy = jest.fn().mockResolvedValue({
      ok: false,
      error: "Policy not found"
    });

    const { getByText } = renderCreateSnapshotPolicyWithRouter(["/edit-snapshot-policy?id=test-policy"], true);
    
    await waitFor(() => getByText("Testing Snapshot Policies"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith(
      "Could not load the policy: Policy not found"
    );
  });

  it("handles policy loading exception gracefully", async () => {
    browserServicesMock.snapshotManagementService.getPolicy = jest.fn().mockRejectedValue(new Error("Network error"));

    const { getByText } = renderCreateSnapshotPolicyWithRouter(["/edit-snapshot-policy?id=test-policy"], true);
    
    await waitFor(() => getByText("Testing Snapshot Policies"));
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Could not load the policy");
  });
});