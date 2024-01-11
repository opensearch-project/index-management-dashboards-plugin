/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";
import IndexSelect from "./IndexSelect";

describe("<IndexSelect /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <IndexSelect
          getIndexOptions={(str) => Promise.resolve([{ label: "sourceIndex" }])}
          onSelectedOptions={(options) => {}}
          selectedOption={[{ label: "sourceIndex" }]}
          singleSelect={true}
        />
      </CoreServicesContext.Provider>
    );
    await waitFor(() => {});
    expect(component).toMatchSnapshot();
  });

  it("renders the component with error", async () => {
    const getIndexOptionsFn = jest.fn().mockRejectedValue("service not available");
    act(() => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <IndexSelect
            getIndexOptions={getIndexOptionsFn}
            onSelectedOptions={(options) => {}}
            selectedOption={[{ label: "sourceIndex" }]}
            singleSelect={true}
          />
        </CoreServicesContext.Provider>
      );
    });
    await waitFor(() => {});
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("search async", async () => {
    const getIndexOptionsFn = jest.fn().mockResolvedValue([{ label: "test-index" }]);
    act(() => {
      render(
        <CoreServicesContext.Provider value={coreServicesMock}>
          <IndexSelect
            getIndexOptions={getIndexOptionsFn}
            onSelectedOptions={(options) => {}}
            selectedOption={[{ label: "sourceIndex" }]}
            singleSelect={false}
          />
        </CoreServicesContext.Provider>
      );
    });
    await waitFor(() => {});
    expect(getIndexOptionsFn).toHaveBeenCalledTimes(1);
  });
});
