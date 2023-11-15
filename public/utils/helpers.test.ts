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
  getRedIndicesInOpenStatus,
} from "./helpers";
import { browserServicesMock } from "../../test/mocks";
import { INDEX_OP_BLOCKS_TYPE, INDEX_OP_TARGET_TYPE } from "./constants";
import { IAPICaller } from "../../models/interfaces";

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
      // eslint-disable-next-line no-throw-literal
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

  it(`filter open red indices`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: "a1 open\na2 close\na3 open\n",
    });
    expect(getRedIndicesInOpenStatus(browserServicesMock)).resolves.toEqual(["a1", "a3"]);

    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: null,
    });
    expect(getRedIndicesInOpenStatus(browserServicesMock)).resolves.toEqual([]);

    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: "\n",
    });
    expect(getRedIndicesInOpenStatus(browserServicesMock)).resolves.toEqual([]);

    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: undefined,
    });
    expect(getRedIndicesInOpenStatus(browserServicesMock)).resolves.toEqual([]);
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

  it(`filterBlockedItems index with red indices`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((params: IAPICaller) => {
      if (params.endpoint === "cluster.state") {
        return { ok: true, response: exampleBlocksStateResponse };
      } else {
        return { ok: true, response: "test_index2 open\ntest_index4 open\ntest_index3 close\n" };
      }
    });
    const selectedItems = [{ index: "test_index1" }, { index: "test_index2" }, { index: "test_index3" }, { index: "test_index4" }];
    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.INDEX, true)
    ).resolves.toEqual({
      blockedItems: ["test_index1", "test_index2", "test_index4"],
      unBlockedItems: ["test_index3"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX,
        true
      )
    ).resolves.toEqual({
      blockedItems: ["test_index1", "test_index2", "test_index4"],
      unBlockedItems: ["test_index3"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        [],
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX,
        true
      )
    ).resolves.toEqual({
      blockedItems: ["test_index2", "test_index4"],
      unBlockedItems: [],
    });
  });

  it(`filterBlockedItems index with red indices empty response`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((params: IAPICaller) => {
      if (params.endpoint === "cluster.state") {
        return { ok: true, response: exampleBlocksStateResponse };
      } else {
        return { ok: true };
      }
    });
    const selectedItems = [{ index: "test_index1" }, { index: "test_index2" }, { index: "test_index3" }, { index: "test_index4" }];
    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.INDEX, true)
    ).resolves.toEqual({
      blockedItems: ["test_index1", "test_index2"],
      unBlockedItems: ["test_index3", "test_index4"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX,
        true
      )
    ).resolves.toEqual({
      blockedItems: ["test_index1"],
      unBlockedItems: ["test_index2", "test_index3", "test_index4"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        [],
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.INDEX,
        true
      )
    ).resolves.toEqual({
      blockedItems: [],
      unBlockedItems: [],
    });
  });

  it(`filterBlockedItems alias with red indices`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((params: IAPICaller) => {
      if (params.endpoint === "cluster.state") {
        return { ok: true, response: exampleBlocksStateResponse };
      } else {
        return { ok: true, response: "test_index2 open\ntest_index4 open\ntest_index3 close\n" };
      }
    });
    const selectedItems = [
      { alias: "alias1", indexArray: ["test_index1", "test_index3"] },
      { alias: "alias2", indexArray: ["test_index1", "test_index4"] },
      { alias: "alias3", indexArray: ["test_index2", "test_index3"] },
    ];

    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.ALIAS, true)
    ).resolves.toEqual({
      blockedItems: ["alias1", "alias2", "alias3"],
      unBlockedItems: [],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY_ALLOW_DELETE, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.ALIAS,
        true
      )
    ).resolves.toEqual({
      blockedItems: ["alias2", "alias3"],
      unBlockedItems: ["alias1"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        [],
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.ALIAS,
        true
      )
    ).rejects.toEqual(new Error("Can only filter red indexes for type index."));
  });

  it(`filterBlockedItems data streams with red indices`, async () => {
    browserServicesMock.commonService.apiCaller = jest.fn().mockResolvedValue({
      ok: true,
      response: exampleBlocksStateResponse,
    });
    browserServicesMock.commonService.apiCaller = jest.fn().mockImplementation((params: IAPICaller) => {
      if (params.endpoint === "cluster.state") {
        return { ok: true, response: exampleBlocksStateResponse };
      } else {
        return { ok: true, response: "test_index2 open\ntest_index4 open\ntest_index3 close\n" };
      }
    });
    const selectedItems = [
      { name: "ds1", indices: [{ index_name: "test_index1" }, { index_name: "test_index3" }] },
      { name: "ds2", indices: [{ index_name: "test_index1" }, { index_name: "test_index4" }] },
      { name: "ds3", indices: [{ index_name: "test_index2" }, { index_name: "test_index3" }] },
    ];

    expect(
      filterBlockedItems(browserServicesMock, selectedItems, INDEX_OP_BLOCKS_TYPE.CLOSED, INDEX_OP_TARGET_TYPE.DATA_STREAM, true)
    ).resolves.toEqual({
      blockedItems: ["ds1", "ds2", "ds3"],
      unBlockedItems: [],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        selectedItems,
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY_ALLOW_DELETE, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.DATA_STREAM,
        true
      )
    ).resolves.toEqual({
      blockedItems: ["ds2", "ds3"],
      unBlockedItems: ["ds1"],
    });

    expect(
      filterBlockedItems(
        browserServicesMock,
        [],
        [INDEX_OP_BLOCKS_TYPE.READ_ONLY, INDEX_OP_BLOCKS_TYPE.META_DATA],
        INDEX_OP_TARGET_TYPE.DATA_STREAM,
        true
      )
    ).rejects.toEqual(new Error("Can only filter red indexes for type index."));
  });
});
