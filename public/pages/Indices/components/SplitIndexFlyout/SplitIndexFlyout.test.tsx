/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {render, waitFor} from "@testing-library/react";
import SplitIndexFlyout from "./SplitIndexFlyout";
import userEvent from "@testing-library/user-event";

describe("<SplitIndexFlyout /> spec", () => {
  const onSplitIndex = jest.fn();
  const closeFlyout = jest.fn();

  it("renders the component", async () => {
    render(
      <SplitIndexFlyout
        sourceIndex={{}}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={() => {
        }}
        setIndexSettings={() => {
        }}
        openIndex={() => {
        }}
        coreServices={() => {
        }}
      />
    );

    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });
    userEvent.type(getByTestId("Target Index Name"), "split_test_index-split");
    userEvent.type(getByTestId("Number of shards"), "4");

    await waitFor(() => {
      userEvent.click(getByTestId("flyout-footer-action-button"));
    });

    await waitFor(() => {
      expect(onSplitIndex).toHaveBeenCalled();
    });
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });
    userEvent.click(getByTestId("flyout-footer-action-button"));
    await waitFor(() => {
      expect(getByText("Target Index Name is required")).not.toBeNull();
      expect(getByText("Number of shards is required")).not.toBeNull();
    });
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });
    userEvent.type(getByTestId("Number of shards"), "3");
    userEvent.click(getByTestId("flyout-footer-action-button"));
    await waitFor(() => {
      expect(getByText("3 must be a multiple of 2")).not.toBeNull();
    });
  });

  it("Red Index is not ready for split", async () => {
    const {getByTestId, findByText} = render(
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(findByText("Source index health must not be red.")).not.toBeNull();
    });
  });

  it("Closed Index is not ready for split", async () => {
    const {getByTestId, findByText} = render(
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(findByText("Source index must not be in close status.")).not.toBeNull();
      expect(getByTestId("open-index-button")).toBeVisible();
    })
  });

  it("blocks.write is not set to true, Index is not ready for split", async () => {
    const {getByTestId, findByText} = render(
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(findByText("Source index must be in block write status.")).not.toBeNull();
      expect(getByTestId("set-indexsetting-button")).not.toBeNull();
    });
  });

  it("blocks.write is not set, Index is not ready for split", async () => {
    const {getByTestId, findByText} = render(
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

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(findByText("Source index must be in block write status.")).not.toBeNull();
      expect(getByTestId("set-indexsetting-button")).not.toBeNull();
    });
  });

  it("Cancel works", async () =>  {
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

    await waitFor(() => {
      userEvent.click(getByTestId("flyout-footer-cancel-button"));
    });

    await waitFor(() => {
      expect(closeFlyout).toHaveBeenCalled();
    });
  });

})
