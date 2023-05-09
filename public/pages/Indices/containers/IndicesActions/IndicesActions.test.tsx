/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import IndicesActions, { IndicesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { createMemoryHistory } from "history";
import { ROUTES } from "../../../../utils/constants";

function renderWithRouter(props: IndicesActionsProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <IndicesActions {...props} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<IndicesActions /> spec", () => {
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
      expect(getByTestId("Open Action")).toBeDisabled();
      expect(getByTestId("Close Action")).toBeDisabled();
      expect(getByTestId("Shrink Action")).toBeDisabled();
      expect(getByTestId("deleteAction")).toBeDisabled();
      expect(getByTestId("Apply policyButton")).toBeDisabled();
      expect(getByTestId("Split Action")).toBeDisabled();
      expect(getByTestId("Reindex Action")).toBeEnabled();
      expect(getByTestId("Clear cache Action")).toBeEnabled();
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
      getByText("Caches of the folowing indexes will be cleared.");
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
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Clear caches for [test_index2] successfully");
    });
  });

  it("clear cache for all indexes successfully by calling commonService", async () => {
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
      selectedItems: [],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Clear cache Action"));
    await waitFor(() => {
      getByText("All indexes' caches will be cleared.");
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
          index: "",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Clear caches for all indexes successfully");
    });
  });

  it("clear cache for all indexes failed if some indexes have blocks by calling commonService", async () => {
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
      getByText("All indexes' caches will be cleared.");
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
          index: "",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith(
        "[cluster_block_exception] index [test_index1] blocked by: [FORBIDDEN/5/index read-only (api)];"
      );
    });
  });

  it("open index by calling commonService", async () => {
    const onOpen = jest.fn();
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
      onOpen,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Open Action"));
    userEvent.click(getByTestId("Open Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.open",
        data: {
          index: "test_index",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Open [test_index] successfully");
      expect(onOpen).toHaveBeenCalledTimes(1);
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
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
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
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
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
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
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
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
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
      getIndices(): Promise<void> {
        return Promise.resolve(undefined);
      },
      history: history,
      location: history.location,
      match: { path: "/", url: "/", isExact: true, params: {} },
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
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
        },
      ],
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
        },
        {
          index: "test_index2",
        },
      ],
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
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Split Action")).toBeDisabled();
  });
});
