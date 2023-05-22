/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  diffJson,
  getBlockedIndices,
  indexBlockedPredicate,
  aliasBlockedPredicate,
  dataStreamBlockedPredicate,
  filterBlockedItems,
  getBlockedIndicesSetWithBlocksType,
} from "./helpers";
import { CatIndex, DataStream } from "../../server/models/interfaces";
import { IAlias } from "../pages/Aliases/interface";
import { browserServicesMock } from "../../test/mocks";
import { INDEX_OP_BLOCKS_TYPE, INDEX_OP_TARGET_TYPE } from "./constants";

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
        "5": {
          description: "index read-only (api)",
          retryable: false,
          levels: ["write", "metadata_write"],
        },
      },
      test_index2: {
        "4": {
          description: "index closed",
          retryable: false,
          levels: ["read", "write"],
        },
      },
    },
  },
};

describe("helpers spec", () => {
  it(`diffJson`, async () => {
    expect(diffJson({ a: 123, b: 456, c: 789 }, { a: 123, b: 456 })).toEqual(1);
    expect(diffJson({ a: 123, b: 456, c: 789 }, { b: 456, a: 123 })).toEqual(1);
    expect(diffJson({ a: 123, b: 456, c: [1, 2, { foo: "bar" }, 4] }, { a: 123, b: 456, c: [1, { foo: "bar" }, 4] })).toEqual(1);
    expect(
      diffJson(
        {
          a: 123,
          b: 456,
          c: {
            a: "2",
            b: "3",
          },
        },
        {
          a: 123,
          c: {
            b: "3",
            c: 4,
          },
        }
      )
    ).toEqual(3);
    expect(
      diffJson(
        {},
        {
          foo: {},
          test: {},
        }
      )
    ).toEqual(2);
  });

  it(`getBlockedIndices normal case`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    expect(getBlockedIndices(browserServicesMock)).resolves.toEqual({
      test_index1: ["4", "5"],
      test_index2: ["4"],
    });
  });

  it(`getBlockedIndices empty case`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        cluster_name: "opensearch-cluster",
        cluster_uuid: "123",
        blocks: {},
      },
    });
    expect(getBlockedIndices(browserServicesMock)).resolves.toEqual({});
  });

  it(`getBlockedIndices error case`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: false,
      error: "test",
    });
    try {
      await getBlockedIndices(browserServicesMock);
      throw "fail";
    } catch (err) {
      expect(err).toEqual("test");
    }
  });

  it(`getBlockedIndicesWithType`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    expect(getBlockedIndicesSetWithBlocksType(browserServicesMock, INDEX_OP_BLOCKS_TYPE.READ_ONLY)).resolves.toEqual(
      new Set(["test_index1"])
    );
    expect(
      getBlockedIndicesSetWithBlocksType(browserServicesMock, [INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_BLOCKS_TYPE.READ_ONLY])
    ).resolves.toEqual(new Set(["test_index1", "test_index2"]));
    expect(
      getBlockedIndicesSetWithBlocksType(browserServicesMock, [INDEX_OP_BLOCKS_TYPE.META_DATA, INDEX_OP_BLOCKS_TYPE.READ_ONLY_ALLOW_DELETE])
    ).resolves.toEqual(new Set([]));
  });

  it(`indexBlockedPredicate`, async () => {
    const blockedItemsSet = new Set(["index_1", "index_2"]);
    expect(indexBlockedPredicate({ index: "index_1" }, blockedItemsSet)).toEqual(true);
    expect(indexBlockedPredicate({ index: "index_3" }, blockedItemsSet)).toEqual(false);
  });

  it(`aliasBlockedPredicate`, async () => {
    const blockedItemsSet = new Set(["index_1", "index_2"]);
    expect(aliasBlockedPredicate({ indexArray: ["index_1", "index_3"] }, blockedItemsSet)).toEqual(true);
    expect(aliasBlockedPredicate({ indexArray: ["index_3", "index_4"] }, blockedItemsSet)).toEqual(false);
  });

  it(`dataStreamBlockedPredicate`, async () => {
    const blockedItemsSet = new Set(["index_1", "index_2"]);
    expect(dataStreamBlockedPredicate({ indices: [{ index_name: "index_1" }, { index_name: "index_3" }] }, blockedItemsSet)).toEqual(true);
    expect(dataStreamBlockedPredicate({ indices: [{ index_name: "index_4" }, { index_name: "index_3" }] }, blockedItemsSet)).toEqual(false);
  });

  it(`filterBlockedItems index`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    const selectedItems = [{ index: "test_index1" }, { index: "test_index2" }, { index: "test_index3" }];
    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.INDEX)
    ).resolves.toEqual({
      blockedItems: ["test_index1", "test_index2"],
      unBlockedItems: ["test_index3"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX
      )
    ).resolves.toEqual({
      blockedItems: ["test_index1"],
      unBlockedItems: ["test_index2", "test_index3"],
    });

    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: { blocks: {} },
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX
      )
    ).resolves.toEqual({
      blockedItems: [],
      unBlockedItems: ["test_index1", "test_index2", "test_index3"],
    });
  });

  it(`filterBlockedItems alias`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    const selectedItems = [
      { alias: "alias1", indexArray: ["test_index1", "test_index3"] },
      { alias: "alias2", indexArray: ["test_index1", "test_index3"] },
      { alias: "alias3", indexArray: ["test_index2", "test_index3"] },
    ];

    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.ALIAS)
    ).resolves.toEqual({
      blockedItems: ["alias1", "alias2", "alias3"],
      unBlockedItems: [],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.ALIAS
      )
    ).resolves.toEqual({
      blockedItems: ["alias1", "alias2"],
      unBlockedItems: ["alias3"],
    });
  });

  it(`filterBlockedItems dataStream`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    const selectedItems = [
      { name: "ds1", indices: [{ index_name: "test_index1" }, { index_name: "test_index2" }] },
      { name: "ds2", indices: [{ index_name: "test_index1" }, { index_name: "test_index3" }] },
      { name: "ds3", indices: [{ index_name: "test_index2" }, { index_name: "test_index3" }] },
    ];
    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.DATA_STREAM)
    ).resolves.toEqual({
      blockedItems: ["ds1", "ds2", "ds3"],
      unBlockedItems: [],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.DATA_STREAM
      )
    ).resolves.toEqual({
      blockedItems: ["ds1", "ds2"],
      unBlockedItems: ["ds3"],
    });
  });

  it(`unexpected INDEX_OP_TARGET_TYPE`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    const selectedItems = [
      { name: "ds1", indices: [{ index_name: "test_index1" }, { index_name: "test_index2" }] },
      { name: "ds2", indices: [{ index_name: "test_index1" }, { index_name: "test_index3" }] },
      { name: "ds3", indices: [{ index_name: "test_index2" }, { index_name: "test_index3" }] },
    ];
    expect(filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, "test")).rejects.toEqual(
      new Error("Unexpected INDEX_OP_TARGET_TYPE: test")
    );
  });
});
