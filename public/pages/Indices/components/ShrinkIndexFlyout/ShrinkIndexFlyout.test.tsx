/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
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
        getIndexSettings={async () => {
          return {};
        }}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(() => {
      expect(document.body.children).toMatchSnapshot();
    });
  });

  it("calls close when cancel button clicked", async () => {
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
        getIndexSettings={async () => {
          return {};
        }}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(() => {
      fireEvent.click(getByTestId("shrinkIndexCloseButton"));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows error when source index's setting index.blocks.write is null", async () => {
    const onClose = jest.fn();
    const setIndexSettings = jest.fn();
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
        getIndexSettings={async () => {
          return {};
        }}
        setIndexSettings={setIndexSettings}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(async () => {
      expect(queryByText("The source index cannot shrink, due to the following reasons:")).not.toBeNull();
      expect(queryByText("The source index's write operations must be blocked.")).not.toBeNull();
      fireEvent.click(getByTestId("onSetIndexWriteBlockButton"));
      expect(setIndexSettings).toHaveBeenCalled();
    });
  });

  it("shows error when source index's setting index.blocks.write is false", async () => {
    const onClose = jest.fn();
    const setIndexSettings = jest.fn();
    const testIndexSettings = {
      test_index: {
        settings: {
          "index.blocks.write": false,
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
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={onClose}
        getIndexSettings={async () => {
          return {};
        }}
        setIndexSettings={setIndexSettings}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(async () => {
      expect(queryByText("The source index cannot shrink, due to the following reasons:")).not.toBeNull();
      expect(queryByText("The source index's write operations must be blocked.")).not.toBeNull();
      fireEvent.click(getByTestId("onSetIndexWriteBlockButton"));
      expect(setIndexSettings).toHaveBeenCalled();
    });
  });

  it("shows error when target index name is not set", async () => {
    const onClose = jest.fn();
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
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={onClose}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(async () => {
      expect(queryByText("Target index name required.")).toBeNull();
    });

    await act(async () => {
      userEvent.type(getByTestId("targetIndexNameInput"), "test_index_shrunken");
    });
    await waitFor(async () => {
      expect(queryByText("Target index name required.")).toBeNull();
    });

    await act(async () => {
      userEvent.clear(getByTestId("targetIndexNameInput"));
    });
    await act(async () => {
      fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    });
    await waitFor(() => {
      expect(queryByText("Target index name required.")).not.toBeNull();
    });
  });

  it("shows error when number of replicas is not valid", async () => {
    const onClose = jest.fn();
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
          rep: "0",
          status: "open",
        }}
        visible
        onConfirm={() => {}}
        onClose={onClose}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(async () => {
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).toBeNull();
    });

    await act(async () => {
      userEvent.clear(getByTestId("numberOfReplicasInput"));
    });

    await waitFor(async () => {
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).not.toBeNull();
    });

    await act(async () => {
      userEvent.type(getByTestId("numberOfReplicasInput"), "-1");
    });

    await waitFor(async () => {
      expect(queryByText("Number of replicas must be greater than or equal to 0.")).not.toBeNull();
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
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index cannot shrink, due to the following reasons:")).not.toBeNull();
      expect(queryByText("The source index's health status is [red]!")).not.toBeNull();
      expect(queryByText("The source index has only one primary shard!")).not.toBeNull();
      expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
    });
  });

  it("shows button when source index cannot shrink", async () => {
    const testIndexSettings = {
      test_index: {
        settings: {},
      },
    };
    const getIndexSettings = jest.fn().mockResolvedValue(testIndexSettings);
    const setIndexSettings = jest.fn();
    const openIndex = jest.fn();
    const getAlias = jest.fn();
    const { getByTestId, queryByText } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "10",
          rep: "1",
          status: "close",
        }}
        visible
        onConfirm={() => {}}
        onClose={() => {}}
        getIndexSettings={getIndexSettings}
        setIndexSettings={setIndexSettings}
        openIndex={openIndex}
        getAlias={getAlias}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index cannot shrink, due to the following reasons:")).not.toBeNull();
      expect(queryByText("The source index must not be in close status!")).not.toBeNull();
      expect(queryByText("The source index's write operations must be blocked.")).not.toBeNull();
      expect(getByTestId("shrinkIndexConfirmButton")).toHaveAttribute("disabled");
      expect(getByTestId("onOpenIndexButton")).not.toBeNull();
      expect(getByTestId("onSetIndexWriteBlockButton")).not.toBeNull();
    });

    await act(async () => {
      fireEvent.click(getByTestId("onOpenIndexButton"));
    });
    await waitFor(() => {
      expect(openIndex).toHaveBeenCalled();
    });

    await act(async () => {
      fireEvent.click(getByTestId("onSetIndexWriteBlockButton"));
    });
    await waitFor(() => {
      expect(setIndexSettings).toHaveBeenCalled();
    });
  });

  it("shows warning when source index is not ready", async () => {
    const testIndexSettings = {
      test_index: {
        settings: {
          "index.blocks.read_only": true,
        },
      },
    };
    const getIndexSettings = jest.fn().mockResolvedValue(testIndexSettings);
    const { queryByText } = render(
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
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index is not ready to shrink, may due to the following reasons:")).not.toBeNull();
      expect(
        queryByText("Index setting [index.blocks.read_only] is [true], this will cause the new shrunken index's shards to be unassigned.")
      ).not.toBeNull();
      expect(queryByText("The source index's health is not green.")).not.toBeNull();
      expect(queryByText("One copy of every shard may not allocated to one node.")).not.toBeNull();
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
    const onConfirm = jest.fn();
    const { queryByText, getByTestId } = render(
      <ShrinkIndexFlyout
        sourceIndex={{
          health: "green",
          index: "test_index",
          pri: "3",
          rep: "1",
          status: "open",
        }}
        visible
        onConfirm={onConfirm}
        onClose={() => {}}
        getIndexSettings={getIndexSettings}
        setIndexSettings={() => {}}
        openIndex={() => {}}
        getAlias={async () => {
          return {};
        }}
      />
    );

    await waitFor(() => {
      expect(queryByText("The source index's health is not green.")).toBeNull();
      expect(queryByText("One copy of every shard may not allocated to one node.")).toBeNull();
    });

    await act(async () => {
      userEvent.type(getByTestId("targetIndexNameInput"), "test_index_shrunken");
      userEvent.type(getByTestId("aliasesInput"), "test_index_alias");
    });

    await act(async () => {
      fireEvent.click(getByTestId("shrinkIndexConfirmButton"));
    });
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
