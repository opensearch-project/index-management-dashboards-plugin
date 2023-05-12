/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import DataStreamsActions, { DataStreamsActionsProps } from "./index";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import { ROUTES } from "../../../../utils/constants";
const historyPushMock = jest.fn();

function renderWithRouter(props: Omit<DataStreamsActionsProps, "history">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <Router>
            <Switch>
              <Route
                path={ROUTES.DATA_STREAMS}
                render={(routeProps) => (
                  <CoreServicesContext.Provider value={coreServicesMock}>
                    <ServicesContext.Provider value={browserServicesMock}>
                      <DataStreamsActions
                        {...props}
                        history={{
                          ...routeProps.history,
                          push: (...args) => {
                            routeProps.history.push(...args);
                            historyPushMock(...args);
                          },
                        }}
                      />
                    </ServicesContext.Provider>
                  </CoreServicesContext.Provider>
                )}
              />
              <Redirect from="/" to={ROUTES.DATA_STREAMS} />
            </Switch>
          </Router>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<DataStreamsActions /> spec", () => {
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onDelete: () => null,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("deleteAction")).toBeDisabled();
    });
  });

  it("delete data streams by calling commonService", async () => {
    const onDelete = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return { ok: true, response: {} };
      }
    );
    const { container, getByTestId, getByPlaceholderText } = renderWithRouter({
      selectedItems: [{ name: "test_data_stream" }],
      onDelete,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("deleteAction"));
    userEvent.type(getByPlaceholderText("delete"), "delete");
    userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "transport.request",
        data: {
          path: `/_data_stream/test_data_stream`,
          method: "DELETE",
        },
      });
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [test_data_stream] successfully");
    });
  }, 30000);

  it("refresh data streams by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  ".ds-blocked-000001": {
                    "4": {},
                  },
                },
              },
            },
          };
        } else if (payload.endpoint === "indices.refresh") {
          return {
            ok: true,
            response: {},
          };
        }
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          name: "unblocked_data_stream",
          indices: [
            {
              index_name: ".ds-unblocked-000001",
            },
            {
              index_name: ".ds-blocked-000002",
            },
          ],
        },
        {
          name: "blocked_data_stream",
          indices: [
            {
              index_name: ".ds-blocked-000001",
            },
            {
              index_name: ".ds-blocked-000002",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following datastream will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_data_stream")).not.toBeNull();
      getByText("The following datastream will not be refreshed because they are closed.");
      expect(getByTestId("BlockedItem-blocked_data_stream")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cluster.state",
        data: {
          metric: "blocks",
        },
      });
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.refresh",
        data: {
          index: "unblocked_data_stream",
        },
      });

      expect(document.body).toMatchSnapshot();

      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Refresh datastream [unblocked_data_stream] successfully"
      );
    });
  }, 30000);

  it("refresh data streams disabled because all indexes are closed calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  ".ds-blocked-000001": {
                    "4": {},
                  },
                },
              },
            },
          };
        } else if (payload.endpoint === "indices.refresh") {
          return {
            ok: true,
            response: {},
          };
        }
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          name: "blocked_data_stream",
          indices: [
            {
              index_name: ".ds-blocked-000001",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following datastream will not be refreshed because they are closed.");
      expect(getByTestId("BlockedItem-blocked_data_stream")).not.toBeNull();
      expect(getByTestId("refreshConfirmButton")).toBeDisabled();
    });
  }, 30000);

  it("refresh data streams even failed to get index status", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          throw "failed to call cluster.state";
        } else if (payload.endpoint === "indices.refresh") {
          return {
            ok: true,
            response: {},
          };
        }
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          name: "blocked_data_stream",
          indices: [
            {
              index_name: ".ds-blocked-000001",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following datastream will be refreshed.");
      expect(getByTestId("UnblockedItem-blocked_data_stream")).not.toBeNull();
      expect(getByTestId("refreshConfirmButton")).toBeEnabled();
    });
  }, 30000);
});
