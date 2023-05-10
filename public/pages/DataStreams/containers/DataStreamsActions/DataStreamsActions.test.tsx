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

  it("clear cache for data streams by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: true,
              response: {
                blocks: {},
              },
            };
          default:
            return {
              ok: true,
              response: {},
            };
        }
      }
    );
    const { container, getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          name: "test_data_stream",
          indices: [
            {
              index_name: ".ds-test_data_stream-000001",
            },
            {
              index_name: ".ds-test_data_stream-000002",
            },
          ],
        },
      ],
      onDelete: () => {},
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("ClearCacheAction"));
    await waitFor(() => {
      getByText("Caches will be cleared for the following data streams.");
    });
    userEvent.click(getByTestId("ClearCacheConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cluster.state",
        data: {
          metric: "blocks",
        },
      });
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.clearCache",
        data: {
          index: "test_data_stream",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Clear caches for [test_data_stream] successfully");
    });
  });

  it("cannot clear cache for data streams if they are closed or blocked", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: true,
              response: {
                blocks: {
                  indices: {
                    ".ds-test_data_stream_1-000001": {
                      "4": {
                        description: "index closed",
                        retryable: false,
                        levels: ["read", "write"],
                      },
                    },
                    ".ds-test_data_stream_2-000001": {
                      "5": {
                        description: "index read-only (api)",
                        retryable: false,
                        levels: ["write", "metadata_write"],
                      },
                    },
                  },
                },
              },
            };
          default:
            return {
              ok: true,
              response: {},
            };
        }
      }
    );
    const { container, getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          name: "test_data_stream_1",
          indices: [
            {
              index_name: ".ds-test_data_stream_1-000001",
              index_uuid: "x",
            },
            {
              index_name: ".ds-test_data_stream_1-000002",
              index_uuid: "y",
            },
          ],
        },
        {
          name: "test_data_stream_2",
          indices: [
            {
              index_name: ".ds-test_data_stream_2-000001",
              index_uuid: "z",
            },
            {
              index_name: ".ds-test_data_stream_2-000002",
              index_uuid: "c",
            },
          ],
        },
      ],
      onDelete: () => {},
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("ClearCacheAction"));
    await waitFor(() => {
      getByText("Caches will not be cleared for the following data streams because one or more backing indexes are closed or blocked.");
    });

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cluster.state",
        data: {
          metric: "blocks",
        },
      });
      expect(getByTestId("ClearCacheConfirmButton")).toBeDisabled();
    });
  });
});
