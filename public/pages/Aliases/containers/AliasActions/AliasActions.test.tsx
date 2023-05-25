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
import AliasesActions, { AliasesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { buildMockApiCallerForFlush, selectedAliases } from "../../../../containers/FlushIndexModal/FlushIndexModalTestHelper";
import { act } from "react-dom/test-utils";

function renderWithRouter(props: Omit<AliasesActionsProps, "history">) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <AliasesActions {...props} history={{} as any} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<AliasesActions /> spec", () => {
  it("renders the component and all the actions should be disabled when no items selected", async () => {
    const { container, getByTestId } = renderWithRouter({
      selectedItems: [],
      onUpdateAlias: () => null,
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

  it("delete alias by calling commonService", async () => {
    const onDelete = jest.fn();
    let times = 0;
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "indices.deleteAlias") {
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
          index: "test_index",
          alias: "1",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_index"],
        },
      ],
      onUpdateAlias: () => null,
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
        endpoint: "indices.deleteAlias",
        data: {
          index: ["test_index"],
          name: ["1"],
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("test error");
      expect(onDelete).toHaveBeenCalledTimes(0);
    });

    userEvent.click(getByTestId("deleteConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete [1] successfully");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("clear cache for aliases by calling commonService", async () => {
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
          index: "test_index",
          alias: "test_alias",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_index"],
        },
      ],
      onUpdateAlias: () => null,
      onDelete: () => {},
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("ClearCacheAction"));
    await waitFor(() => {
      getByText("Cache will be cleared for the following aliases.");
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
          index: "test_alias",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Cache for test_alias has been successfully cleared.");
    });
  });

  it("cannot clear cache for aliases if some indexes are closed or blocked", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        return {
          ok: true,
          response: {
            blocks: {
              indices: {
                test_1: {
                  "4": {
                    description: "index closed",
                    retryable: false,
                    levels: ["read", "write"],
                  },
                },
                test_2: {
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
          index: "test_1",
          alias: "test_alias1",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_1"],
        },
        {
          index: "test_2",
          alias: "test_alias2",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_2"],
        },
      ],
      onUpdateAlias: () => null,
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
        text: "Cache cannot be cleared for the selected aliases because they are closed or blocked.",
      });
    });
  });

  it("filter aliases failed when clearing caches for multiple aliases", async () => {
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
          index: "test_index1",
          alias: "test_alias1",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_index1"],
        },
        {
          index: "test_index2",
          alias: "test_alias2",
          filter: "1",
          "routing.index": "1",
          "routing.search": "1",
          is_write_index: "1",
          indexArray: ["test_index2"],
        },
      ],
      onUpdateAlias: () => null,
      onDelete: () => {},
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("ClearCacheAction"));
    await waitFor(() => {
      getByText("Cache will be cleared for the following aliases.");
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
          index: "test_alias1,test_alias2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith(
        "Cache for 2 aliases [test_alias1, test_alias2] have been successfully cleared."
      );
    });
  });

  it("renders flush component", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId, getByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <AliasesActions selectedItems={selectedAliases} history={{} as any} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Flush Action"));
    await act(async () => {});
    expect(getByText("The following aliases will be flushed:")).toBeInTheDocument();
    expect(document.body.children).toMatchSnapshot();
  });

  it("flush all aliases disabled", async () => {
    browserServicesMock.commonService.apiCaller = buildMockApiCallerForFlush();
    const { getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <ModalProvider>
            <AliasesActions selectedItems={[]} history={{} as any} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    expect(getByTestId("Flush Action")).toBeDisabled();
  });
});
