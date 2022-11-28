/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import SplitIndexFlyout from "./SplitIndexFlyout";
import userEvent from "@testing-library/user-event";

describe("<SplitIndexFlyout /> spec", () => {
  const onSplitIndex = jest.fn();
  const closeFlyout = jest.fn();
  const openIndex = jest.fn();
  const setIndexSettings = jest.fn();

  const indexSettings = {
    split_test_index: {
      index: "split_test_index",
      settings: {
        "index.blocks.write": "true",
      },
    },
  };
  const getIndexSettings = jest.fn().mockResolvedValue(indexSettings);

  it("renders the component", async () => {
    render(
      <SplitIndexFlyout
        sourceIndex={{} as any}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("Successful split an index whose shards number is greater than 1", async () => {
    const { getByTestId } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });

    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");

    await waitFor(() => {
      userEvent.type(getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "4{enter}");
    });

    userEvent.type(getByTestId("numberOfReplicasInput"), "1");

    userEvent.click(getByTestId("flyout-footer-action-button"));

    await waitFor(() => {
      expect(onSplitIndex).toHaveBeenCalled();
    });
  }, 15000);

  it("Successful split an index whose shards number is 1", async () => {
    const { getByTestId } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "1",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });

    userEvent.type(getByTestId("targetIndexNameInput"), "split_test_index-split");

    await waitFor(() => {
      userEvent.type(getByTestId("numberOfShardsInput").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element, "2{enter}");
    });

    userEvent.click(getByTestId("flyout-footer-action-button"));

    await waitFor(() => {
      expect(onSplitIndex).toHaveBeenCalled();
    });
  }, 15000); // set timeout to 15s to overwrite the default 10s because this case takes a little long

  it("Error message if index name is not specified", async () => {
    const { getByTestId, getByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).not.toBeDisabled();
    });

    userEvent.click(getByTestId("flyout-footer-action-button"));

    await waitFor(() => {
      expect(getByText("Target Index Name is required")).not.toBeNull();
    });
  });

  it("Error message if index name or number of shards is not specified", async () => {
    const { getByTestId, getByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
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

  it("Red Index is not ready for split", async () => {
    const { getByTestId, queryByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "red",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(queryByText("Source index health must not be red.")).not.toBeNull();
    });
  });

  it("Closed Index is not ready for split", async () => {
    const { getByTestId, queryByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "close",
          } as any
        }
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={openIndex}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(queryByText("Source index must not be in close status.")).not.toBeNull();
    });
    userEvent.click(getByTestId("open-index-button"));
    await waitFor(() => {
      expect(openIndex).toHaveBeenCalled();
    });
  });

  it("blocks.write is not set to true, Index is not ready for split", async () => {
    const { getByTestId, queryByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={async () => {
          return {
            split_test_index: {
              index: "split_test_index",
              settings: {
                "index.blocks.write": "false",
              },
            },
          };
        }}
        setIndexSettings={setIndexSettings}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(queryByText("Source index must be in block write status.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    await waitFor(() => {
      expect(setIndexSettings).toHaveBeenCalled();
    });
  });

  it("blocks.write is not set, Index is not ready for split", async () => {
    const { getByTestId, queryByText } = render(
      <SplitIndexFlyout
        sourceIndex={
          {
            health: "green",
            index: "split_test_index",
            pri: "2",
            rep: "0",
            status: "open",
          } as any
        }
        onCloseFlyout={() => {}}
        onSplitIndex={() => {}}
        getIndexSettings={async () => {
          return {
            split_test_index: {
              index: "split_test_index",
              settings: {},
            },
          };
        }}
        setIndexSettings={setIndexSettings}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("flyout-footer-action-button")).toBeDisabled();
      expect(queryByText("Source index must be in block write status.")).not.toBeNull();
    });

    userEvent.click(getByTestId("set-indexsetting-button"));
    await waitFor(() => {
      expect(setIndexSettings).toHaveBeenCalled();
    });
  });

  it("Cancel works", async () => {
    const { getByTestId } = render(
      <SplitIndexFlyout
        sourceIndex={{} as any}
        onCloseFlyout={closeFlyout}
        onSplitIndex={onSplitIndex}
        getIndexSettings={async () => ({})}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return { ok: true, response: [] };
        }}
      />
    );

    await waitFor(() => {
      userEvent.click(getByTestId("flyout-footer-cancel-button"));
    });

    await waitFor(() => {
      expect(closeFlyout).toHaveBeenCalled();
    });
  });
});
