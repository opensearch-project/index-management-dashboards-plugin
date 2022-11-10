/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {render} from "@testing-library/react";
import SplitIndexFlyout from "./SplitIndexFlyout";
import userEvent from "@testing-library/user-event";

describe("<SplitIndexFlyout /> spec", () => {
  it("renders the component", async () => {
    render(
      <SplitIndexFlyout
        sourceIndex={{}}
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={() => {}}
        coreServices={() => {}}
      />
    );
    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when close button clicked", async () => {
    const { getByTestId } = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "2",
          rep: "0",
          status: "open",
        }}
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={() => {}}
        coreServices={() => {}}
      />
    );
    expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    userEvent.type(getByTestId("form-name-targetIndex"), "index-ut");
    userEvent.type(getByTestId("form-name-index.number_of_shards"),"3");
    userEvent.click(getByTestId("flyout-footer-action-button"));
  });

});
