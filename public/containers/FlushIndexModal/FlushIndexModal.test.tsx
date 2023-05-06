/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { CoreServicesContext } from "../../components/core_services";
import { ServicesContext } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ModalProvider } from "../../components/Modal";
import { CoreStart } from "opensearch-dashboards/public";
import FlushIndexModal, { FlushIndexModalProps } from "./FlushIndexModal";

function renderWithRouter(
  coreServicesContext: CoreStart | null,
  browserServicesContext: BrowserServices | null,
  props: FlushIndexModalProps
) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesContext}>
        <ServicesContext.Provider value={browserServicesContext}>
          <ModalProvider>
            <FlushIndexModal {...props} />
          </ModalProvider>
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

describe("<FlushIndexModal /> spec", () => {
  it("renders the component", async () => {
    render(<FlushIndexModal flushableItems={["test1"]} visible blockedItems={["test2"]} flushTarget="indices" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders the component with alias", async () => {
    render(<FlushIndexModal flushableItems={["test1"]} visible blockedItems={["test2"]} flushTarget="alias" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders the component with data stream", async () => {
    render(<FlushIndexModal flushableItems={["test1"]} visible blockedItems={["test2"]} flushTarget="data stream" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders with flush all indices", async () => {
    render(<FlushIndexModal flushableItems={[]} visible blockedItems={[]} flushTarget="indices" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders with no flushable items", async () => {
    render(<FlushIndexModal flushableItems={[]} visible blockedItems={["test2"]} flushTarget="indices" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("renders with no blocked items", async () => {
    render(<FlushIndexModal flushableItems={["test1"]} visible blockedItems={[]} flushTarget="indices" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("confirm flush index", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { getByTestId } = renderWithRouter(coreServicesMock, browserServicesMock, {
      flushableItems: ["test1", "test2"],
      blockedItems: ["test3"],
      visible: true,
      flushTarget: "indices",
      onClose: onClose,
    });

    fireEvent.click(getByTestId("Flush Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.flush",
        data: {
          index: "test1,test2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Flush [test1,test2] successfully");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("browser service context not ready", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { getByTestId } = renderWithRouter(coreServicesMock, null, {
      flushableItems: ["test1", "test2"],
      blockedItems: ["test3"],
      visible: true,
      flushTarget: "indices",
      onClose: onClose,
    });

    fireEvent.click(getByTestId("Flush Confirm button"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).not.toHaveBeenCalled();
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledWith("Something is wrong in ServiceContext");
    });
  });

  it("flush index returns an error", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: false, response: {} });
    const { getByTestId } = renderWithRouter(coreServicesMock, browserServicesMock, {
      flushableItems: ["test1", "test2"],
      blockedItems: ["test3"],
      visible: true,
      flushTarget: "indices",
      onClose: onClose,
    });

    fireEvent.click(getByTestId("Flush Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.flush",
        data: {
          index: "test1,test2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("flush all indices", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { getByTestId } = renderWithRouter(coreServicesMock, browserServicesMock, {
      flushableItems: [],
      blockedItems: [],
      visible: true,
      flushTarget: "indices",
      onClose: onClose,
    });

    fireEvent.click(getByTestId("Flush Confirm button"));

    await waitFor(() => {
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledTimes(1);
      expect(browserServicesMock.commonService.apiCaller).toHaveBeenCalledWith({
        endpoint: "indices.flush",
        data: {
          index: "",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Flush all open indices successfully");
    });
  });
});
