/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, waitFor } from "@testing-library/react";
import React from "react";
import ReindexAdvancedOptions from "./ReindexAdvancedOptions";
import { coreServicesMock } from "../../../../../test/mocks";
import { CoreServicesContext } from "../../../../components/core_services";

describe("<ReindexAdvancedOptions /> spec", () => {
  it("renders the component", async () => {
    const component = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          conflicts="proceed"
          onConflictsChange={() => {}}
          getAllPipelines={async () => [{ label: "pipeline" }]}
        />
      </CoreServicesContext.Provider>
    );
    // wait for one tick
    await waitFor(() => {});
    expect(component).toMatchSnapshot();
  });

  it("renders the component with slice error", async () => {
    const { findByText } = render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          sliceErr={"slice must be positive integer or auto"}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          conflicts="proceed"
          onConflictsChange={() => {}}
          getAllPipelines={async () => [{ label: "pipeline" }]}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(findByText("slice must be positive integer or auto")).not.toBeNull();
  });

  it("get pipeline error", async () => {
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          conflicts="proceed"
          onConflictsChange={() => {}}
          getAllPipelines={async () => Promise.reject("service not available")}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(coreServicesMock.notifications.toasts.addDanger).toHaveBeenCalledTimes(1);
  });

  it("get pipeline api been called", async () => {
    const getPipeline = jest.fn().mockResolvedValue([{ label: "test1" }]);
    render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ReindexAdvancedOptions
          slices="1"
          onSlicesChange={() => {}}
          selectedPipelines={[]}
          onSelectedPipelinesChange={() => {}}
          conflicts="proceed"
          onConflictsChange={() => {}}
          getAllPipelines={getPipeline}
        />
      </CoreServicesContext.Provider>
    );

    // wait for one tick
    await waitFor(() => {});
    expect(getPipeline).toBeCalledTimes(1);
  });
});
