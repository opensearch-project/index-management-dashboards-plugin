/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IAPICaller } from "../../../models/interfaces";

const exampleBlocksStateResponse = {
  cluster_name: "opensearch-cluster",
  cluster_uuid: "123",
  blocks: {
    indices: {
      test_index1: {
        "4": {
          description: "index closed",
          retryable: false,
          levels: ["read", "write"],
        },
      },
      test_index2: {
        "5": {
          description: "index read-only (api)",
          retryable: false,
          levels: ["write", "metadata_write"],
        },
      },
    },
  },
};

interface MockApiCallerForFlushArguments {
  flush_success?: boolean;
  block_success?: boolean;
  has_red_indices?: boolean;
  cat_indices_success?: boolean;
}

function buildMockApiCallerForFlush({
  flush_success = true,
  block_success = true,
  has_red_indices = true,
  cat_indices_success = true,
}: MockApiCallerForFlushArguments = {}): jest.Mock<any, any> {
  return jest.fn().mockImplementation((params: IAPICaller) => {
    if (params.endpoint === "indices.flush") {
      return { ok: flush_success, response: {}, error: "some error in flush" };
    } else if (params.endpoint === "cluster.state") {
      return {
        ok: block_success,
        response: exampleBlocksStateResponse,
      };
    } else {
      return {
        ok: cat_indices_success,
        response: has_red_indices ? "test_index4 open\n" : undefined,
      };
    }
  });
}

const selectedAliases = [
  {
    alias: "alias1",
    indexArray: ["test_index1", "test_index3"],
  },
  {
    alias: "alias2",
    indexArray: ["test_index3"],
  },
  {
    alias: "alias3",
    indexArray: ["test_index3", "test_index4"],
  },
];
const selectedDataStreams = [
  {
    name: "ds1",
    indices: [{ index_name: "test_index1" }, { index_name: "test_index3" }],
  },
  {
    name: "ds2",
    indices: [{ index_name: "test_index3" }],
  },
  {
    name: "ds3",
    indices: [{ index_name: "test_index3" }, { index_name: "test_index4" }],
  },
];
const selectedIndices = [{ index: "test_index1" }, { index: "test_index2" }, { index: "test_index3" }, { index: "test_index4" }];

export { buildMockApiCallerForFlush, exampleBlocksStateResponse, selectedAliases, selectedDataStreams, selectedIndices };
