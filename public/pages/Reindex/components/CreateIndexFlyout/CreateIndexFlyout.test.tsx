/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import CreateIndexFlyout from "./CreateIndexFlyout";
import { coreServicesMock, browserServicesMock, apiCallerMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import { ServicesContext } from "../../../../services";

describe("<CreateIndexFlyout /> spec", () => {
  beforeEach(() => {
    apiCallerMock(browserServicesMock);
  });
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <CreateIndexFlyout sourceIndices={[]} onCloseFlyout={() => {}} />,
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    );
    await waitFor(
      () => expect((document.querySelector("#accordionForCreateIndexSettings") as HTMLDivElement).style.height).toEqual("0px"),
      {
        timeout: 3000,
      }
    );
    expect(component).toMatchSnapshot();
  }, 20000);
});
