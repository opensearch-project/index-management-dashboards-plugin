/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { isEqual } from "lodash";
import { BrowserServices } from "../models/interfaces";
import { INDEX_OP_BLOCKS_TYPE, INDEX_OP_TARGET_TYPE } from "./constants";
import { CatIndex, DataStream } from "../../server/models/interfaces";
import { IAlias } from "../pages/Aliases/interface";
import { ClusterInfo } from "../models/interfaces";
import { CommonService } from "../services";

export function getErrorMessage(err: any, defaultMessage: string) {
  if (err && err.message) return err.message;
  return defaultMessage;
}

export const makeId = htmlIdGenerator();

// Helper method to return wildcard option suggestion by checking if there's already '*' at the end.
export const wildcardOption = (searchValue: string): string => {
  return searchValue.endsWith("*") ? searchValue : `${searchValue}*`;
};

export function diffJson(oldJson?: Record<string, any>, newJson?: Record<string, any>): number {
  let initial = 0;
  const oldKeys = Object.keys(oldJson || {});
  const addOrChanged = Object.entries(newJson || {}).reduce((total, [key, value]) => {
    if (Object.prototype.toString.call(value) === "[object Object]") {
      total += diffJson(oldJson?.[key], value);
    } else {
      total += isEqual(oldJson?.[key], value) ? 0 : 1;
    }

    const findIndex = oldKeys.findIndex((item) => item === key);
    if (findIndex > -1) {
      oldKeys.splice(findIndex, 1);
    }

    return total;
  }, 0);
  /**
   * oldJson: null | undefined
   * newJson: {}
   */
  if ((oldJson === undefined || oldJson === null) && addOrChanged === 0 && newJson) {
    initial += 1;
  }
  return initial + addOrChanged + oldKeys.length;
}

export const getClusterInfo = (props: { commonService: CommonService }): Promise<ClusterInfo> => {
  return props.commonService
    .apiCaller<{
      cluster_name: string;
    }>({
      endpoint: "cluster.health",
    })
    .then((res) => {
      if (res && res.ok) {
        return {
          cluster_name: res?.response?.cluster_name,
        };
      }

      return {};
    });
};

interface BlockedIndices {
  [indexName: string]: String[];
}

interface ClusterBlocksStateResponse {
  blocks: {
    indices?: {
      [indexName: string]: {
        [blockId: string]: {
          description: string;
          retryable: boolean;
          levels: string[];
        };
      };
    };
  };
}

export async function getRedIndices(browserServices: BrowserServices, filterRedIndices: boolean = false): Promise<string[]> {
  const result = await browserServices.commonService.apiCaller<string>({
    endpoint: "cat.indices",
    data: {
      /* only return index_names and "\n" 
      e.g. {"ok":true,"response":"index1\nindex2\n"}
      */
      h: "i",
      health: "red",
    },
  });
  if (!result.ok) {
    throw result.error;
  }
  return result.response.split("\n").filter((s) => s !== "");
}

export async function getBlockedIndices(browserServices: BrowserServices): Promise<BlockedIndices> {
  const result = await browserServices.commonService.apiCaller<ClusterBlocksStateResponse>({
    endpoint: "cluster.state",
    data: {
      metric: "blocks",
    },
  });
  if (!result.ok) {
    throw result.error;
  }

  const blocksResponse = result.response.blocks;
  if (!blocksResponse.indices) {
    return {};
  }

  const blockedIndices: BlockedIndices = {};
  Object.keys(blocksResponse.indices).forEach((indexName) => {
    const innerBlocksInfo = blocksResponse.indices![indexName];
    const indexOpBlocksIds = Object.keys(innerBlocksInfo);
    blockedIndices[indexName] = indexOpBlocksIds;
  });
  return blockedIndices;
}

export async function getBlockedIndicesSetWithBlocksType(
  browserServices: BrowserServices,
  blocksTypes: INDEX_OP_BLOCKS_TYPE | INDEX_OP_BLOCKS_TYPE[]
): Promise<Set<string>> {
  const blocksTypesSet = new Set(Array.isArray(blocksTypes) ? blocksTypes : [blocksTypes]);
  const blockedIndices = await getBlockedIndices(browserServices);
  // we only care about the indices with blocks type in blocksTypesSet
  // use set to accelarate execution
  return new Set(
    Object.entries(blockedIndices)
      .filter(
        // blockedIndex is like this: ["index_name": ["4","5"]]
        (blockedIndex) => blockedIndex[1].find((s) => blocksTypesSet.has(s as INDEX_OP_BLOCKS_TYPE))
        // we only take index name, do not need blocksType
      )
      .map((blockedIndex) => blockedIndex[0])
  );
}

export interface FilteredBlockedItems {
  unBlockedItems: string[];
  blockedItems: string[];
}

export function indexBlockedPredicate(item: Pick<CatIndex, "index">, blockedItemsSet: Set<string>): boolean {
  return blockedItemsSet.has(item.index);
}

export function aliasBlockedPredicate(item: Pick<IAlias, "indexArray">, blockedItemsSet: Set<String>): boolean {
  return !!item.indexArray.find((indexName) => blockedItemsSet.has(indexName));
}

export function dataStreamBlockedPredicate(item: Pick<DataStream, "indices">, blockedItemsSet: Set<String>): boolean {
  return !!item.indices.find((dataStreamIndex) => blockedItemsSet.has(dataStreamIndex.index_name));
}

export async function filterBlockedItems(
  browserServices: BrowserServices,
  originInputItems: IAlias[] | DataStream[] | CatIndex[],
  blocksTypes: INDEX_OP_BLOCKS_TYPE | INDEX_OP_BLOCKS_TYPE[],
  indexOpTargetType: INDEX_OP_TARGET_TYPE,
  filterRedIndices: boolean = false
): Promise<FilteredBlockedItems> {
  const result: FilteredBlockedItems = {
    unBlockedItems: [],
    blockedItems: [],
  };
  var redIndices: string[] = [];
  if (filterRedIndices) {
    if (!originInputItems.length && indexOpTargetType !== INDEX_OP_TARGET_TYPE.INDEX) {
      throw new Error("Can only filter red indexes for type index.");
    }
    redIndices = await getRedIndices(browserServices);
  }
  if (!originInputItems.length) {
    /* for refresh all or flush all indices, we need to find all indices in red status,
    for other case, we just return [] for blockedItems and unBlockedItems */
    result.blockedItems = redIndices;
    return result;
  }
  var filteredBlockedIndicesSet = await getBlockedIndicesSetWithBlocksType(browserServices, blocksTypes);
  filteredBlockedIndicesSet = new Set([...filteredBlockedIndicesSet, ...redIndices]);

  var inputItems: IAlias[] | DataStream[] | CatIndex[];
  switch (indexOpTargetType) {
    case INDEX_OP_TARGET_TYPE.ALIAS:
      inputItems = (originInputItems as unknown) as IAlias[];
      inputItems.forEach((item) => {
        if (aliasBlockedPredicate(item, filteredBlockedIndicesSet)) result.blockedItems.push(item.alias);
        else result.unBlockedItems.push(item.alias);
      });
      break;
    case INDEX_OP_TARGET_TYPE.DATA_STREAM:
      inputItems = (originInputItems as unknown) as DataStream[];
      inputItems.forEach((item) => {
        if (dataStreamBlockedPredicate(item, filteredBlockedIndicesSet)) result.blockedItems.push(item.name);
        else result.unBlockedItems.push(item.name);
      });
      break;
    case INDEX_OP_TARGET_TYPE.INDEX:
      inputItems = (originInputItems as unknown) as CatIndex[];
      inputItems.forEach((item) => {
        if (indexBlockedPredicate(item, filteredBlockedIndicesSet)) result.blockedItems.push(item.index);
        else result.unBlockedItems.push(item.index);
      });
      break;
    default:
      throw new Error(`Unexpected INDEX_OP_TARGET_TYPE: ${indexOpTargetType}`);
  }
  return result;
}
