/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import IndicesActions, { IndicesActionsProps } from "./index";
import { ModalProvider } from "../../../../components/Modal";
import { ServicesContext } from "../../../../services";
import { CoreServicesContext } from "../../../../components/core_services";

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

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
    await waitFor(() => {
      expect(getByTestId("Open Action")).toBeDisabled();
      expect(getByTestId("Close Action")).toBeDisabled();
      expect(getByTestId("Shrink Action")).toBeDisabled();
      expect(getByTestId("Delete Action")).toBeDisabled();
      expect(getByTestId("Apply policyButton")).toBeDisabled();
      expect(getByTestId("Split Action")).toBeDisabled();
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

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
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
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Open index successfully");
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

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
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
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Close index successfully");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shrink index by calling commonService", async () => {
    const onShrink = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });

    const { container, getByTestId } = renderWithRouter({
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
          data_stream: "",
        },
      ],
      onShrink,
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
    userEvent.click(getByTestId("Shrink Action"));
    userEvent.type(getByTestId("targetIndexNameInput"), "test_index_shrunken");
    userEvent.click(getByTestId("shrinkIndexConfirmButton"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(2);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.shrink",
        data: {
          index: "test_index",
          target: "test_index_shrunken",
          body: {
            settings: {
              "index.number_of_shards": 1,
            },
          },
        },
      });
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.getSettings",
        data: {
          index: "test_index",
          flat_settings: true,
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Shrink index successfully");
      expect(onShrink).toHaveBeenCalledTimes(1);
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

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
    userEvent.click(getByTestId("Delete Action"));
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
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Delete successfully");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("reindex index by calling commonService", async () => {
    const onReindex = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((args) => {
      if (args.endpoint === "indices.get") {
        return Promise.resolve({
          ok: true,
          response: { test_index: { settings: {} } },
        });
      } else {
        return Promise.resolve({ ok: true, response: {} });
      }
    });

    const { container, getByTestId } = renderWithRouter({
      onClose(): void {},
      onDelete(): void {},
      onOpen(): void {},
      onShrink(): void {},
      onReindex,
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
          data_stream: "",
        },
      ],
    });

    await waitFor(() => {
      expect(container.firstChild).toMatchSnapshot();
    });

    userEvent.click(document.querySelector('[data-test-subj="More Action"] button') as Element);
    userEvent.click(getByTestId("Reindex Action"));
    userEvent.type(getByTestId("destIndicesComboInput").querySelector("input") as Element, "reindex-dest");
    userEvent.click(screen.getByTestId("flyout-footer-action-button"));

    await waitFor(() => {
      expect(onReindex).toHaveBeenCalledTimes(1);
    });
  });
});
