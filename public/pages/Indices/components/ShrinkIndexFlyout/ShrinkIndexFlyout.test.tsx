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

  it("calls close when cancel button clicked", () => {
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

    expect(queryByText("*Name of the target index required.*")).toBeNull();
    fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    expect(queryByText("Name of the target index required.")).not.toBeNull();
  });

  it("shows error when number of shards is not valid", async () => {
    const onClose = jest.fn();
    const { getByTestId, queryByText, debug } = render(
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

    userEvent.type(getByTestId("numberOfShardsInput"), "2");
    fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    await waitFor(() => {
      expect(
        queryByText("The number of new primary shards must be a positive factor of the number of primary shards in the source index[3].")
      ).not.toBeNull();
    });
  });

  it("shows danger when source index cannot shrink", async () => {
    const testIndexSettings = {
      test_index: {
        settings: {},
      },
    };
    const getIndexSettings = jest.fn().mockResolvedValue(testIndexSettings);
    const { getByTestId, queryByText } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "red",
          index: "test_index",
          pri: "1",
          rep: "1",
          status: "close",
        }}
        visible
        onConfirm={() => {}}
        onClose={() => {}}
        getIndexSettings={getIndexSettings}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index cannot shrink, due to the following reasons:")).not.toBeNull();
      expect(queryByText("The index's health status is [red]!")).not.toBeNull();
      expect(queryByText("The index has only one primary shard!")).not.toBeNull();
      expect(queryByText("The index is closed!")).not.toBeNull();
      expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    });
  });

  it("shows warning when source index is not ready", async () => {
    const testIndexSettings = {
      test_index: {
        settings: {},
      },
    };
    const getIndexSettings = jest.fn().mockResolvedValue(testIndexSettings);
    const { getByTestId, queryByText } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "yellow",
          index: "test_index",
          pri: "3",
          rep: "1",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={() => {}}
        getIndexSettings={getIndexSettings}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index is not ready to shrink, may due to the following reasons:")).not.toBeNull();
      expect(queryByText("The index's health is not green.")).not.toBeNull();
      expect(queryByText("Index setting [index.blocks.write] is not [true].")).not.toBeNull();
      expect(queryByText("One copy of every shard should be allocated to one node.")).not.toBeNull();
    });
  });

  it("no warning when source index is ready", async () => {
    const testIndexSettings = {
      test_index: {
        settings: {
          "index.blocks.write": true,
          "index.routing.allocation.require._name": "node1",
        },
      },
    };
    const getIndexSettings = jest.fn().mockResolvedValue(testIndexSettings);
    const { getByTestId, queryByText } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "3",
          rep: "1",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={() => {}}
        getIndexSettings={getIndexSettings}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index's health is not green.")).toBeNull();
      expect(queryByText("Index setting [index.blocks.write] is not [true].")).toBeNull();
      expect(queryByText("One copy of every shard should be allocated to one node.")).toBeNull();
    });
  });
});
