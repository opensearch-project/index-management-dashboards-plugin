/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, HashRouter as Router, Switch, Redirect } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import DataStreamsActions, { DataStreamsActionsProps } from "./index";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { ROUTES } from "../../../../utils/constants";
import { buildMockApiCallerForFlush, selectedDataStreams } from "../../../../containers/FlushIndexModal/FlushIndexModalTestHelper";
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
      getByText("Cache will be cleared for the following data streams.");
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
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for test_data_stream has been successfully cleared."
      );
    });
  });

  it("cannot clear cache for data streams if they are closed or blocked", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
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
      }
    );
    const { container, getByTestId } = renderWithRouter({
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
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cluster.state",
        data: {
          metric: "blocks",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith({
        title: "Unable to clear cache",
        text: "Cache cannot be cleared for the selected data streams because they are closed or blocked.",
      });
    });
  });

  it("filter data streams failed when clearing caches for multiple data streams", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: true,
              error: "test failure",
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
          name: "test_data_stream1",
          indices: [
            {
              index_name: ".ds-test_data_stream1-000001",
            },
            {
              index_name: ".ds-test_data_stream1-000002",
            },
          ],
        },
        {
          name: "test_data_stream2",
          indices: [
            {
              index_name: ".ds-test_data_stream2-000001",
            },
            {
              index_name: ".ds-test_data_stream2-000002",
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
      getByText("Cache will be cleared for the following data streams.");
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
          index: "test_data_stream1,test_data_stream2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for 2 data streams [test_data_stream1, test_data_stream2] have been successfully cleared."
      );
    });
  });

  it("renders flush component", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId, getByText, queryByTestId } = render(
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
                        selectedItems={selectedDataStreams}
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
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Flush Action"));
    await waitFor(() => {
      expect(queryByTestId("Flush Action")).toBeNull();
      expect(getByText("The following data streams will be flushed:")).toBeInTheDocument();
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("flush all data streams disabled", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId } = render(
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
                        selectedItems={[]}
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
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Flush Action")).toBeDisabled();
  });

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
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: "red_index close\n",
          };
        }
      }
    );

    const { getByTestId, getByText, queryByTestId } = renderWithRouter({
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
      expect(queryByTestId("refreshAction")).toBeNull();
      getByText("The following data stream will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_data_stream")).not.toBeNull();
      getByText(
        "The following data stream cannot be refreshed because each data stream has one or more indexes that are either closed or in red status."
      );
      expect(getByTestId("BlockedItem-blocked_data_stream")).not.toBeNull();
      expect(document.body).toMatchSnapshot();
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
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cat.indices",
        data: {
          h: "i,s",
          health: "red",
        },
      });

      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "The data stream [unblocked_data_stream] has been successfully refreshed."
      );
    });
  }, 30000);

  it("refresh multiple data streams by calling commonService", async () => {
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
                  ".ds-blocked1-000001": {
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
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: ".ds-red-000001 close\n",
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
              index_name: ".ds-unblocked-000002",
            },
          ],
        },
        {
          name: "unblocked_data_stream1",
          indices: [
            {
              index_name: ".ds-unblocked1-000001",
            },
            {
              index_name: ".ds-unblocked1-000002",
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
        {
          name: "blocked_data_stream1",
          indices: [
            {
              index_name: ".ds-blocked1-000001",
            },
            {
              index_name: ".ds-blocked1-000002",
            },
          ],
        },
        {
          name: "red_data_stream",
          indices: [
            {
              index_name: ".ds-red-000001",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following data streams will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_data_stream")).not.toBeNull();
      expect(getByTestId("UnblockedItem-unblocked_data_stream1")).not.toBeNull();
      expect(getByTestId("UnblockedItem-red_data_stream")).not.toBeNull();
      getByText(
        "The following data streams cannot be refreshed because each data stream has one or more indexes that are either closed or in red status."
      );
      expect(getByTestId("BlockedItem-blocked_data_stream")).not.toBeNull();
      expect(getByTestId("BlockedItem-blocked_data_stream1")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "3 data streams [unblocked_data_stream, unblocked_data_stream1, red_data_stream] have been successfully refreshed."
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
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: ".ds-red-000001 open\n",
          };
        }
      }
    );

    const { getByTestId } = renderWithRouter({
      selectedItems: [
        {
          name: "blocked_data_stream",
          indices: [
            {
              index_name: ".ds-blocked-000001",
            },
          ],
        },
        {
          name: "red_data_stream",
          indices: [
            {
              index_name: ".ds-red-000001",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith({
        text:
          "All selected data streams cannot be refreshed because each data stream has one or more indexes that are either closed or in red status.",
        title: "Unable to refresh data streams.",
      });
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
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: "red_index close\n",
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
      getByText("The following data stream will be refreshed.");
      expect(getByTestId("UnblockedItem-blocked_data_stream")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "The data stream [blocked_data_stream] has been successfully refreshed."
      );
    });
  }, 30000);

  it("refresh multi data streams even failed to get index status", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          throw "failed to call cluster.state";
        } else if (payload.endpoint === "indices.refresh") {
          return {
            ok: true,
            response: {},
          };
        } else if (payload.endpoint === "cat.indices") {
          return {
            ok: true,
            response: "red_index close\n",
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
        {
          name: "blocked_data_stream1",
          indices: [
            {
              index_name: ".ds-blocked1-000001",
            },
          ],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following data streams will be refreshed.");
      expect(getByTestId("UnblockedItem-blocked_data_stream")).not.toBeNull();
      expect(getByTestId("UnblockedItem-blocked_data_stream1")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "2 data streams [blocked_data_stream, blocked_data_stream1] have been successfully refreshed."
      );
    });
  }, 30000);
});
