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
import { IAPICaller } from "../../../../../models/interfaces";

const exampleBlocksStateResponse = {
  cluster_name: "opensearch-cluster",
  cluster_uuid: "123",
  blocks: {
    indices: {
      test_index1: {
        "4": {
          description: "index closed",
          retryable: false,
          levels: ["read", "write"],
        },
      },
      test_index2: {
        "5": {
          description: "index read-only (api)",
          retryable: false,
          levels: ["write", "metadata_write"],
        },
      },
    },
  },
};

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

  it("flush alias by calling commonService", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((params: IAPICaller) => {
      if (params.endpoint === "indices.flush") {
        return { ok: true, response: {} };
      } else {
        return {
          ok: true,
          response: exampleBlocksStateResponse,
        };
      }
    });

    const { container, getByTestId } = renderWithRouter({
      selectedItems: [
        {
          alias: "alias1",
          indexArray: ["test_index1", "test_index3"],
        },
        {
          alias: "alias2",
          indexArray: ["test_index3"],
        },
      ],
    });

    userEvent.click(document.querySelector('[data-test-subj="moreAction"] button') as Element);
    userEvent.click(getByTestId("Flush Action"));
    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(getByTestId("Flush Modal Title")).toHaveTextContent("Flush alias");
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "cluster.state",
        data: {
          metric: "blocks",
        },
      });
    });
    userEvent.click(getByTestId("Flush Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.flush",
        data: {
          index: "alias2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Flush [alias2] successfully");
    });
  });
});
