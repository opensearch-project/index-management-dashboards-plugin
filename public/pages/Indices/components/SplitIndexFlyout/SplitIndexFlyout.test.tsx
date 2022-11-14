/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {act, render} from "@testing-library/react";
import SplitIndexFlyout from "./SplitIndexFlyout";
import userEvent from "@testing-library/user-event";

describe("<SplitIndexFlyout /> spec", () => {
  const onSplitIndex = jest.fn();
  const closeFlyout = jest.fn();

  it("renders the component", () => {
    render(
      <SplitIndexFlyout
        sourceIndex={{}}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {}}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );
    expect(document.body.children).toMatchSnapshot();
  });

  it("Successful split an index", async () => {
    const {getByTestId} = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "green",
          index: "split_test_index",
          pri: "2",
          rep: "0",
          status: "open",
        }}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {
          return {
            "split_test_index": {
              "settings": {
                "index.blocks.write": "true"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />,
    );
    expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    userEvent.type(getByTestId("Target Index Name"), "split_test_index-split");
    userEvent.type(getByTestId("Number of shards"), "4");

    await act(async () => {
      userEvent.click(getByTestId("flyout-footer-action-button"));
    });
    expect(onSplitIndex).toHaveBeenCalled();
  });

  it("Error message if index name or shards number is not specified", async () => {
    const {getByTestId, getByText} = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "green",
          index: "split_test_index",
          pri: "2",
          rep: "0",
          status: "open",
        }}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {
          return {
            "split_test_index": {
              "settings": {
                "index.blocks.write": "true"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />,
    );
    expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    await act(async () => {
      await
        userEvent.click(getByTestId("flyout-footer-action-button"));
    });
    expect(
      getByText("Target Index Name is required")
    ).not.toBeNull();
    expect(
      getByText("Number of shards is required")
    ).not.toBeNull();
  });

  it("Incorrect number of shards is not allowed", async () => {
    const {getByTestId, getByText} = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "green",
          index: "split_test_index",
          pri: "2",
          rep: "0",
          status: "open",
        }}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {
          return {
            "split_test_index": {
              "settings": {
                "index.blocks.write": "true"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />,
    );
    expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    userEvent.type(getByTestId("Number of shards"), "3");
    await act(async () => {
      await
        userEvent.click(getByTestId("flyout-footer-action-button"));
    });
    expect(
      getByText("3 must be a multiple of 2")
    ).not.toBeNull();
  });

  it("Red Index is not ready for split", () => {
    const {getByTestId, getByText} = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "red",
          index: "test_index",
          pri: "2",
          rep: "0",
          status: "open",
        }}
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={() => {
          return {
            "test_index": {
              "settings": {
                "index.blocks.write": "true"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );
    expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(
      getByText("Source index health must not be red.")
    ).not.toBeNull();
  });

  it("Closed Index is not ready for split", () => {
    const {getByTestId} = render(
      <SplitIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "2",
          rep: "0",
          status: "close",
        }}
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={() => {
          return {
            "test_index": {
              "settings": {
                "index.blocks.write": "true"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );

    expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(getByTestId("open-index-button")).toBeVisible();
  });

  it("blocks.write is not set to true, Index is not ready for split", () => {
    const {getByTestId} = render(
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
        getIndexSettings={() => {
          return {
            "test_index": {
              "settings": {
                "index.blocks.write": "false"
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );

    expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(getByTestId("set-indexsetting-button")).not.toBeNull();
  });

  it("blocks.write is not set, Index is not ready for split", () => {
    const {getByTestId} = render(
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
        getIndexSettings={() => {
          return {
            "test_index": {
              "settings": {
              }
            }
          }
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );

    expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
    expect(getByTestId("set-indexsetting-button")).not.toBeNull();
  });

  it("Cancel works", () => {
    const {getByTestId} = render(
      <SplitIndexFlyout
        sourceIndex={{}}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {}}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        coreServices={() => {}}
      />
    );
    userEvent.click(getByTestId("flyout-footer-cancel-button"));
    expect(closeFlyout).toHaveBeenCalled();
  });

})
