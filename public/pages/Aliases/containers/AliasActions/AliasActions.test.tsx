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
import { IAlias } from "../../interface";

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
    indexArray: ["test_index2", "test_index3"],
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
});

describe("<AliasesActions /> spec", () => {
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
      expect(getByTestId("UnblockedItem-2")).not.toBeNull();
      getByText("The following aliases will not be refreshed because they are closed.");
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
    });

    expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Refresh aliases [2] successfully");
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
                  test_index1: {
                    "4": {},
                  },
                  test_index2: {
                    "4": {},
                  },
                  test_index3: {
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

    const { getByTestId, getByText, queryByTestId } = renderWithRouter({
      selectedItems,
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("refreshAction"));

    await waitFor(() => {
      expect(queryByTestId("refreshAction")).toBeNull();
      getByText("The following aliases will not be refreshed because they are closed.");
      expect(getByTestId("BlockedItem-1")).not.toBeNull();
      expect(getByTestId("refreshConfirmButton")).toBeDisabled();
      expect(document.body).toMatchSnapshot();
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
      expect(getByTestId("refreshConfirmButton")).toBeEnabled();
      expect(document.body).toMatchSnapshot();
    });
  });
});
