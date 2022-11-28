/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import CreateIndexFlyout from "./CreateIndexFlyout";
import { coreServicesMock, browserServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import userEvent from "@testing-library/user-event";

apiCallerMock(browserServicesMock);

describe("<CreateIndexFlyout /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <CreateIndexFlyout sourceIndices={[]} commonService={browserServicesMock.commonService} onCloseFlyout={() => {}} />,
      </CoreServicesContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });

  it("click create button", async () => {
    const { getByText, getByTestId } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <CreateIndexFlyout sourceIndices={[]} commonService={browserServicesMock.commonService} onCloseFlyout={() => {}} />,
      </CoreServicesContext.Provider>
    );
    // click create button
    userEvent.click(getByTestId("flyout-footer-action-button"));

    await waitFor(() => {
      expect(getByText("Index name can not be null.")).toBeInTheDocument();
    });
  });
});
