/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import AliasesActions, { AliasesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";
import { buildMockApiCallerForFlush, selectedAliases } from "../../../../containers/FlushIndexModal/FlushIndexModalTestHelper";
import { IAlias } from "../../interface";
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

const selectedItems: IAlias[] = [
  {
    index: "test_index",
    alias: "1",
    filter: "1",
    "routing.index": "1",
    "routing.search": "1",
    is_write_index: "1",
    indexArray: ["test_index", "test_index1"],
  },
  {
    index: "test_index2",
    alias: "2",
    filter: "1",
    "routing.index": "1",
    "routing.search": "1",
    is_write_index: "1",
    indexArray: ["test_index2", "test_index3", "red_index"],
  },
];

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
      async (): Promise<any> => {
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
    const { getByTestId, getByText, queryByTestId } = render(
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
    await waitFor(() => {
      expect(queryByTestId("Flush Action")).toBeNull();
      expect(getByText("The following aliases will be flushed:")).toBeInTheDocument();
      expect(document.body.children).toMatchSnapshot();
    });
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

  it("refresh alias by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  test_index1: {
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
      selectedItems,
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      expect(queryByTestId("refreshAction")).toBeNull();
      getByText("The following alias will be refreshed.");
      expect(getByTestId("UnblockedItem-2")).not.toBeNull();
      getByText(
        "The following alias cannot be refreshed because each alias has one or more indexes that are either closed or in red status."
      );
      expect(getByTestId("BlockedItem-1")).not.toBeNull();
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
          index: selectedItems[1].alias,
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

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("The alias [2] has been successfully refreshed.");
  });

  it("refresh multiple aliases by calling commonService", async () => {
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
          index: "test_index",
          alias: "1",
          indexArray: ["test_index", "test_index1"],
        },
        {
          index: "test_index2",
          alias: "2",
          indexArray: ["test_index2", "test_index3"],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));
    await waitFor(() => {
      getByText("The following aliases will be refreshed.");
      expect(getByTestId("UnblockedItem-1")).not.toBeNull();
      expect(getByTestId("UnblockedItem-2")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("2 aliases [1, 2] have been successfully refreshed.");
    });
  });

  it("refresh alias blocked because all index are blocked", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        if (payload.endpoint === "cluster.state") {
          return {
            ok: true,
            response: {
              blocks: {
                indices: {
                  test_index: {
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
      selectedItems,
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith({
        text:
          "All selected aliases cannot be refreshed because each alias has one or more indexes that are either closed or in red status.",
        title: "Unable to refresh aliases.",
      });
    });
  });

  it("refresh alias even failed to get index status", async () => {
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
      }
    );

    const { getByTestId, getByText } = renderWithRouter({
      selectedItems: [
        {
          index: "test_index",
          alias: "1",
          indexArray: ["test_index", "test_index1"],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));

    await waitFor(() => {
      getByText("The following alias will be refreshed.");
      expect(getByTestId("UnblockedItem-1")).not.toBeNull();
    });

    userEvent.click(getByTestId("refreshConfirmButton"));

    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("The alias [1] has been successfully refreshed.");
    });
  });

  it("refresh multi alias even failed to get index status", async () => {
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
      }
    );

    const { getByTestId, getByText, queryByTestId } = renderWithRouter({
      selectedItems,
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));

    await waitFor(() => {
      expect(queryByTestId("refreshAction")).toBeNull();
      getByText("The following aliases will be refreshed.");
      expect(getByTestId("UnblockedItem-1")).not.toBeNull();
      expect(getByTestId("UnblockedItem-2")).not.toBeNull();
      expect(getByTestId("refreshConfirmButton")).toBeEnabled();
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
          index: "1,2",
        },
      });
    });

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("2 aliases [1, 2] have been successfully refreshed.");
  });
});
