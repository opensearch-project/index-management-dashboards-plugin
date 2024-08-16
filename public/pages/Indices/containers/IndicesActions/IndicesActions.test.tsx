/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { Route, Switch, HashRouter as Router, RouteComponentProps } from "react-router-dom";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import IndicesActions, { IndicesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { createMemoryHistory } from "history";
import { ROUTES } from "../../../../utils/constants";
import { buildMockApiCallerForFlush, selectedIndices } from "../../../../containers/FlushIndexModal/FlushIndexModalTestHelper";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../../services/Services", () => ({
  ...jest.requireActual("../../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

function renderWithRouter(
  props: Omit<IndicesActionsProps, "history"> & { history?: IndicesActionsProps["history"]; location?: RouteComponentProps["location"] }
) {
  return {
    ...render(
      <Router>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <ModalProvider>
              <Switch>
                <Route path="/" render={(routeProps) => <IndicesActions history={routeProps.history} {...props} />} />
              </Switch>
            </ModalProvider>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<IndicesActions /> spec", () => {
  /**
   * OuiPopover is using requestAnimationFrame
   * to do some async state change.
   * But requestAnimationFrame behaves with long delay in JSDom env
   * Rewrite the request animation frame to make it run immediately.
   * https://github.com/jestjs/jest/issues/5147 for reference
   */
  beforeEach(() => {
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: any) => cb());
  });
  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore();
  });
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onDelete: () => null,
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("Open Action")).toBeDisabled();
      expect(getByTestId("Close Action")).toBeDisabled();
      expect(getByTestId("Shrink Action")).toBeDisabled();
      expect(getByTestId("deleteAction")).toBeDisabled();
      expect(getByTestId("Apply policyButton")).toBeDisabled();
      expect(getByTestId("Split Action")).toBeDisabled();
      expect(getByTestId("Reindex Action")).toBeEnabled();
      expect(getByTestId("Clear cache Action")).toBeEnabled();
      expect(getByTestId("Flush Action")).toBeEnabled();
      expect(getByTestId("Refresh Index Action")).toBeEnabled();
    });
  });

  it("clear cache for mulitple indexes by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: true,
              response: {
                blocks: {
                  indices: {
                    test_index1: {
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
          health: "green",
          index: "test_index1",
        },
        {
          health: "green",
          index: "test_index2",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("Cache will be cleared for the following indexes.");
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
          index: "test_index2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Cache for test_index2 has been successfully cleared.");
    });
  });

  it("clear cache for all indexes successfully by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {},
        };
      }
    );
    const { container, getByTestId, getByText } = renderWithRouter({
      selectedItems: [],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("Cache will be cleared for all open indexes.");
    });
    userEvent.click(getByTestId("ClearCacheConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.clearCache",
        data: {
          index: "_all",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for all open indexes have been successfully cleared."
      );
    });
  });

  it("clear cache for all indexes failed if some indexes are blocked", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return {
          ok: false,
          error: "[cluster_block_exception] index [test_index1] blocked by: [FORBIDDEN/5/index read-only (api)];",
          body: {
            error: {
              root_cause: [
                {
                  type: "cluster_block_exception",
                  reason: "index[test_index1] blocked by: [FORBIDDEN/5/index read-only (api)];",
                },
              ],
              type: "cluster_block_exception",
              reason: "index[test_index1] blocked by: [FORBIDDEN/5/index read-only (api)];",
            },
            status: 403,
          },
        };
      }
    );
    coreServicesMock.notifications.toasts.addError = jest.fn();
    const { container, getByTestId, getByText } = renderWithRouter({
      selectedItems: [],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("Cache will be cleared for all open indexes.");
    });
    userEvent.click(getByTestId("ClearCacheConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.clearCache",
        data: {
          index: "_all",
        },
      });
      expect(coreServicesMock.notifications.toasts.addError).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addError).toHaveBeenCalledWith(
        new Error("[cluster_block_exception] index [test_index1] blocked by: [FORBIDDEN/5/index read-only (api)];"),
        {
          title: "Clear cache failed.",
          toastMessage: "One or more indexes are blocked.",
        }
      );
    });
  });

  it("unable to clear cache when clearing cache for a closed or blocked index", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {
            blocks: {
              indices: {
                test_index1: {
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
          health: "green",
          index: "test_index1",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));

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
        text: "Cache cannot be cleared for test_index1 because it is closed or blocked.",
      });
    });
  });

  it("filter some closed or blocked indices when clearing caches for multiple indices", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: true,
              response: {
                blocks: {
                  indices: {
                    test_index1: {
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
          health: "green",
          index: "test_index1",
        },
        {
          health: "green",
          index: "test_index2",
        },
        {
          health: "green",
          index: "test_index3",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("Cache will be cleared for the following indexes.");
      getByText("Cache will not be cleared for the following indexes because they may be closed or blocked.");
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
          index: "test_index2,test_index3",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for 2 indexes [test_index2, test_index3] have been successfully cleared."
      );
    });
  });

  it("filter indices failed when clearing caches for multiple indices", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "cluster.state":
            return {
              ok: false,
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
          health: "green",
          index: "test_index1",
        },
        {
          health: "green",
          index: "test_index2",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("Cache will be cleared for the following indexes.");
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
          index: "test_index1,test_index2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for 2 indexes [test_index1, test_index2] have been successfully cleared."
      );
    });
  });

  it("open index by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "1",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "",
        },
      ],
      onDelete: function (): void {
        throw new Error("Function not implemented.");
      },
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Open Action"));
    userEvent.click(getByTestId("Open Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "transport.request",
        data: {
          method: "POST",
          path: `/test_index/_open?wait_for_completion=false`,
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Successfully started opening test_index.", {
        toastLifeTimeMs: 432000000,
      });
    });
  });

  it("close index by calling commonService", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { container, getByTestId, getByPlaceholderText } = renderWithRouter({
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "1",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "",
        },
      ],
      onClose,
      onDelete: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Close Action"));
    userEvent.type(getByPlaceholderText("close"), "close");
    userEvent.click(getByTestId("Close Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.close",
        data: {
          index: "test_index",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Close [test_index] successfully");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("delete index by calling commonService", async () => {
    const onDelete = jest.fn();
    let times = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "indices.delete") {
          if (times >= 1) {
            return {
              ok: true,
              response: {},
            };
          } else {
            times++;
            return {
              ok: false,
              error: "test error",
            };
          }
        }
        return { ok: true, response: {} };
      }
    );
    const { container, getByTestId, getByPlaceholderText } = renderWithRouter({
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "1",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "",
        },
      ],
      onDelete,
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("deleteAction"));
    userEvent.type(getByPlaceholderText("delete"), "delete");
    userEvent.click(getByTestId("Delete Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.delete",
        data: {
          index: "test_index",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("test error");
      expect(onDelete).toHaveBeenCalledTimes(0);
    });

    userEvent.click(getByTestId("Delete Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [test_index] successfully");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  }, 30000);

  it("shrink index by calling commonService", async () => {
    const history = createMemoryHistory();

    const { container, getByTestId } = renderWithRouter({
      history: history,
      location: history.location,
      onClose(): void {},
      onDelete(): void {},
      onShrink(): void {},
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: null,
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Shrink Action"));

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe(ROUTES.SHRINK_INDEX);
    expect(history.location.search).toBe("?source=test_index");
  });

  it("shrink action is disabled if multiple indices are selected", async () => {
    const history = createMemoryHistory();

    const { container, getByTestId } = renderWithRouter({
      history: history,
      location: history.location,
      onClose(): void {},
      onDelete(): void {},
      onShrink(): void {},
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index1",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: null,
        },
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index2",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: null,
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("Shrink Action")).toBeDisabled();
    });
  });

  it("shrink action is disabled if the selected index is data_stream", async () => {
    const history = createMemoryHistory();

    const { container, getByTestId } = renderWithRouter({
      history: history,
      location: history.location,
      onClose(): void {},
      onDelete(): void {},
      onShrink(): void {},
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "test",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("Shrink Action")).toBeDisabled();
    });
  });

  it("click reindex goes to new page with selected item ", async () => {
    const history = createMemoryHistory();

    const { getByTestId } = renderWithRouter({
      history: history,
      location: history.location,
      onClose(): void {},
      onDelete(): void {},
      onShrink(): void {},
      selectedItems: [
        {
          "docs.count": "5",
          "docs.deleted": "2",
          health: "green",
          index: "test_index",
          pri: "1",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "store.size": "100KB",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          data_stream: "",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Reindex Action"));

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe(ROUTES.REINDEX);
    expect(history.location.search).toBe("?source=test_index");
  });

  it("click reindex goes to new page without selected item", async () => {
    const history = createMemoryHistory();

    const { getByTestId } = renderWithRouter({
      history: history,
      location: history.location,
      onClose(): void {},
      onDelete(): void {},
      onShrink(): void {},
      selectedItems: [],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Reindex Action"));

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe(ROUTES.REINDEX);
    expect(history.location.search).toBe("");
  });

  it("Split index by calling commonService", async () => {
    const history = createMemoryHistory();
    const { container, getByTestId } = renderWithRouter({
      history: history,
      selectedItems: [
        {
          health: "green",
          index: "test_index",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          data_stream: null,
          "docs.count": "5",
          "docs.deleted": "2",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          "store.size": "100KB",
        },
      ],
      onDelete: function (): void {
        throw new Error("Function not implemented.");
      },
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Split Action")).not.toBeDisabled();
    userEvent.click(getByTestId("Split Action"));
  });

  it("split action is disabled if multiple indices are selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [
        {
          index: "test_index1",
          health: "green",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          data_stream: null,
          "docs.count": "5",
          "docs.deleted": "2",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          "store.size": "100KB",
        },
        {
          index: "test_index2",
          health: "green",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          data_stream: null,
          "docs.count": "5",
          "docs.deleted": "2",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          "store.size": "100KB",
        },
      ],
      onDelete: function (): void {
        throw new Error("Function not implemented.");
      },
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Split Action")).toBeDisabled();
  });

  it("split action is disabled if the selected index is data_stream", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [
        {
          index: "test_index",
          data_stream: "test",
          health: "green",
          pri: "3",
          "pri.store.size": "100KB",
          rep: "0",
          status: "open",
          "docs.count": "5",
          "docs.deleted": "2",
          uuid: "some_uuid",
          managed: "",
          managedPolicy: "",
          "store.size": "100KB",
        },
      ],
      onDelete: function (): void {
        throw new Error("Function not implemented.");
      },
      onClose: function (): void {
        throw new Error("Function not implemented.");
      },
      onShrink: function (): void {
        throw new Error("Function not implemented.");
      },
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Split Action")).toBeDisabled();
  });

  it("renders flush component", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId, getByText, queryByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <IndicesActions selectedItems={selectedIndices} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Flush Action"));
    await waitFor(() => {
      expect(queryByTestId("Flush Action")).toBeNull();
      expect(getByText("The following indexes will be flushed:")).toBeInTheDocument();
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("renders flush all indices enabled", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <IndicesActions selectedItems={[]} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Flush Action")).toBeEnabled();
  });

  it("refresh selected indexes by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  blocked_index: {
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
            response: "red_index open\n",
          };
        }
      }
    );

    const { getByTestId, getByText, queryByTestId } = renderWithRouter({
      selectedItems: [
        {
          index: "unblocked_index",
        },
        {
          index: "blocked_index",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      expect(queryByTestId("Refresh Index Action")).toBeNull();
      getByText("The following index will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_index")).not.toBeNull();
      getByText("The following index cannot be refreshed because they are either closed or in red status.");
      expect(getByTestId("BlockedItem-blocked_index")).not.toBeNull();
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
          index: "unblocked_index",
        },
      });
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cat.indices",
        data: {
          h: "i,s",
          health: "red",
        },
      });
    });

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
      "The index [unblocked_index] has been successfully refreshed."
    );
  });

  it("refresh multiple selected indexes by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {},
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
            response: "red_index open\n",
          };
        }
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          index: "unblocked_index",
        },
        {
          index: "unblocked_index1",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      getByText("The following indexes will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_index")).not.toBeNull();
      expect(getByTestId("UnblockedItem-unblocked_index1")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "2 indexes [unblocked_index, unblocked_index1] have been successfully refreshed."
      );
    });
  });

  it("refresh selected indexes disabled because all of them are closed or in red status", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  blocked_index: {
                    "4": {},
                  },
                  blocked_index1: {
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
            response: "red_index open\n",
          };
        }
      }
    );

    const { getByTestId } = renderWithRouter({
      selectedItems: [
        {
          index: "blocked_index",
        },
        {
          index: "blocked_index1",
        },
        {
          index: "red_index",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith({
        text: "All selected indexes cannot be refreshed because they are either closed or in red status.",
        title: "Unable to refresh indexes.",
      });
    });
  });

  it("refresh all open index by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              indices: {
                red_index: {
                  "4": {},
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
        return { ok: false, error: "wrong endpoint" };
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      getByText("All open indexes will be refreshed.");
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("All open indexes have been successfully refreshed.");
    });
  });

  it("refresh all open index disabled due to red index", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {},
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
            response: "red_index open\n",
          };
        }
        return { ok: false, error: "wrong endpoint" };
      }
    );

    const { getByTestId } = renderWithRouter({
      selectedItems: [],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith({
        text: "Cannot refresh all open indexes because [red_index] is in red status.",
        title: "Unable to refresh indexes.",
      });
    });
  });

  it("refresh selected indexes even failed to get index status", async () => {
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
            response: "red_index open\n",
          };
        }
        return { ok: false, error: "wrong endpoint" };
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          index: "blocked_index",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      getByText("The following index will be refreshed.");
      expect(getByTestId("UnblockedItem-blocked_index")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "The index [blocked_index] has been successfully refreshed."
      );
    });
  });

  it("refresh multi selected indexes even failed to get index status", async () => {
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
            response: "red_index open\n",
          };
        }
        return { ok: false, error: "wrong endpoint" };
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          index: "unblocked_index",
        },
        {
          index: "blocked_index",
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Refresh Index Action"));
    await waitFor(() => {
      getByText("The following indexes will be refreshed.");
      expect(getByTestId("UnblockedItem-unblocked_index")).not.toBeNull();
      expect(getByTestId("UnblockedItem-blocked_index")).not.toBeNull();
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
          index: "unblocked_index,blocked_index",
        },
      });
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cat.indices",
        data: {
          h: "i,s",
          health: "red",
        },
      });
    });

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
      "2 indexes [unblocked_index, blocked_index] have been successfully refreshed."
    );
  });
});
