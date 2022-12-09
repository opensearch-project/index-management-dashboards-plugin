/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "@testing-library/react";
import React from "react";
import CreateIndexFlyout from "./CreateIndexFlyout";
import { coreServicesMock, browserServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";

apiCallerMock(browserServicesMock);

describe("<CreateIndexFlyout /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <CreateIndexFlyout sourceIndices={[]} onCloseFlyout={() => {}} />,
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
