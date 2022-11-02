/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShrinkIndexFlyout from "./ShrinkIndexFlyout";

describe("<ShrinkIndexFlyout /> spec", () => {
  it("renders the component", async () => {
    render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "3",
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={() => {}}
        getIndexSettings={() => {}}
      />
    );

    expect(document.body.children).toMatchSnapshot();
  });

  it("calls close when close button clicked", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "3",
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={onClose}
        getIndexSettings={() => {}}
      />
    );

    fireEvent.click(getByTestId("shrinkIndexCloseButton"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows error when target index name is not set", () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "3",
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={onClose}
        getIndexSettings={() => {}}
      />
    );

    expect(queryByText("Name of the target index required.")).toBeNull();
    fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    expect(queryByText("Name of the target index required.")).not.toBeNull();
  });

  // it("shows error when number of shards is not valid", async () => {
  //   const onClose = jest.fn();
  //   const { getByTestId, queryByText, debug } = render(
  //     <ShrinkIndexFlyout sourceIndex={
  //       {
  //         health: "green",
  //         index: "test_index",
  //         pri: "3",
  //         rep: "0",
  //         status: "open",
  //       }
  //     } visible onConfirm={() => { }} onClose={onClose} getIndexSettings={() => { }} />);
  //
  //   userEvent.type(getByTestId("numberOfShardsInput"), 2);
  //   fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
  //   await waitFor(() => expect(queryByText("positive factor")).not.toBeNull());
  // });
});
