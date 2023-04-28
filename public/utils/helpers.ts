/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { isEqual } from "lodash";
import { BrowserServices } from "../models/interfaces";
import { IndexOpBlocksType } from "./constants";
import { CatIndex, DataStream } from "../../server/models/interfaces";
import { IAlias } from "../pages/Aliases/interface";

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

// code related to filter blocked index/alias/datastream
interface BlockedIndices {
  [indexName: string]: String[];
}

export async function getBlockedIndices(broserServices: BrowserServices): Promise<BlockedIndices> {
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
  const result = await broserServices.commonService.apiCaller<ClusterBlocksStateResponse>({
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

export interface FilteredBlockedItems<T> {
  unBlockedItems: T[];
  blockedItems: T[];
}

export function indexBlockedPredicate(item: CatIndex, blockedItemsSet: Set<string>): boolean {
  return blockedItemsSet.has(item.index);
}

export function aliasBlockedPredicate(item: IAlias, blockedItemsSet: Set<String>): boolean {
  return !!item.indexArray.find((indexName) => blockedItemsSet.has(indexName));
}

export function dataStreamBlockedPredicate(item: DataStream, blockedItemsSet: Set<String>): boolean {
  return !!item.indices.find((dataStreamIndex) => blockedItemsSet.has(dataStreamIndex.index_name));
}

export async function filterBlockedItems<T>(
  broserServices: BrowserServices,
  inputItems: T[],
  blocksTypes: IndexOpBlocksType | IndexOpBlocksType[],
  blocksPredicate: (item: T, blockedItemsSet: Set<string>) => boolean
): Promise<FilteredBlockedItems<T>> {
  const blocksTypesSet = new Set(Array.isArray(blocksTypes) ? blocksTypes : [blocksTypes]);
  const blockedIndices = await getBlockedIndices(broserServices);
  // we only care about the indices with blocks type in blocksTypesSet
  // use set to accelarate execution
  const filteredBlockedIndicesSet = new Set(
    Object.entries(blockedIndices)
      .filter(
        // blockedIndex is like this: ["index_name": ["4","5"]]
        (blockedIndex) => blockedIndex[1].find((s) => blocksTypesSet.has(s as IndexOpBlocksType))
        // we only take index name, do not need blocksType
      )
      .map((blockedIndex) => blockedIndex[0])
  );
  const result: FilteredBlockedItems<T> = {
    unBlockedItems: [],
    blockedItems: [],
  };
  inputItems.forEach((item) => {
    if (blocksPredicate(item, filteredBlockedIndicesSet)) {
      result.blockedItems.push(item);
    } else {
      result.unBlockedItems.push(item);
    }
  });
  return result;
}
