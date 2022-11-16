/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "@testing-library/react";
import React from "react";
import ReindexAdvancedOptions from "./ReindexAdvancedOptions";

describe("<ReindexAdvancedOptions /> spec", () => {
  it("renders the component", async () => {
    let component = render(
      <ReindexAdvancedOptions
        slices="1"
        onSlicesChange={() => {}}
        pipelines={[]}
        selectedPipelines={[]}
        onSelectedPipelinesChange={() => {}}
        conflicts="proceed"
        onConflictsChange={() => {}}
        onQueryJsonChange={() => {}}
        onSubsetChange={() => {}}
        queryJsonString="{}"
        subset={true}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it("renders the component with slice error", async () => {
    const { getByText } = render(
      <ReindexAdvancedOptions
        slices="1"
        onSlicesChange={() => {}}
        sliceErr={"slice must be positive integer or auto"}
        pipelines={[]}
        selectedPipelines={[]}
        onSelectedPipelinesChange={() => {}}
        conflicts="proceed"
        onConflictsChange={() => {}}
        onQueryJsonChange={() => {}}
        onSubsetChange={() => {}}
        queryJsonString="{}"
        subset={false}
      />
    );

    expect(getByText("slice must be positive integer or auto")).toBeInTheDocument();
  });
});
