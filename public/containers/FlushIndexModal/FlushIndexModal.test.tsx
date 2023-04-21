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
import { ModalProvider } from "../../components/Modal";
import FlushIndexModal, { FlushIndexModalProps } from "./FlushIndexModal";

function renderWithRouter(props: FlushIndexModalProps) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
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
    render(<FlushIndexModal selectedItems={["test"]} visible flushTarget="indices" onClose={() => {}} />);
    expect(document.body.children).toMatchSnapshot();
  });

  it("confirm flush index", async () => {
    const onClose = jest.fn();
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({ ok: true, response: {} });
    const { getByTestId } = renderWithRouter({
      selectedItems: ["test_index1", "test_index2"],
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
          index: "test_index1,test_index2",
        },
      });
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledTimes(1);
      expect(coreServicesMock.notifications.toasts.addSuccess).toHaveBeenCalledWith("Flush [test_index1,test_index2] successfully");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
