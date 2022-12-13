/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { IndicesQueryParams } from "../models/interfaces";
import { IndexItem } from "../../../../models/interfaces";
import { ServerResponse } from "../../../../server/models/types";
import { CommonService, IndexService } from "../../../services";
import { CoreStart } from "opensearch-dashboards/public";
import { CatIndex } from "../../../../server/models/interfaces";

export function getURLQueryParams(location: { search: string }): IndicesQueryParams {
  const { from, size, search, sortField, sortDirection, showDataStreams } = queryString.parse(location.search);
  return <IndicesQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? "index" : sortField,
    sortDirection: typeof sortDirection !== "string" ? DEFAULT_QUERY_PARAMS.sortDirection : sortDirection,
    showDataStreams: showDataStreams === undefined ? DEFAULT_QUERY_PARAMS.showDataStreams : showDataStreams === "true",
  };
}

export async function openIndices(indices: string[], callback: any, commonService: CommonService, coreServices: CoreStart) {
  const result = await commonService.apiCaller({
    endpoint: "indices.open",
    data: {
      index: indices,
    },
  });
  if (result && result.ok) {
    coreServices.notifications.toasts.addSuccess(`Open [${indices}] successfully`);
    callback && callback();
  } else {
    const errorMessage = `There is a problem open index ${indices}, please check with Admin`;
    coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getIndexSettings(
  indexName: string,
  flat: boolean,
  commonService: CommonService,
  coreServices: CoreStart
): Promise<Record<string, IndexItem>> {
  const result: ServerResponse<Record<string, IndexItem>> = await commonService.apiCaller({
    endpoint: "indices.getSettings",
    data: {
      index: indexName,
      flat_settings: flat,
    },
  });
  if (result && result.ok) {
    return result.response;
  } else {
    const errorMessage = `There is a problem getting index setting for ${indexName}, please check with Admin`;
    coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getSingleIndice(indexName: string, indexService: IndexService, coreServices: CoreStart): Promise<CatIndex> {
  const result = await indexService.getIndices({
    from: 0,
    size: 1,
    search: indexName,
    indices: [indexName],
    sortDirection: "desc",
    sortField: "index",
    showDataStreams: true,
  });

  if (result && result.ok) {
    return result.response.indices[0];
  } else {
    const errorMessage = `There is a problem getting index for ${indexName}, please check with Admin`;
    coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function setIndexSettings(
  indexName: string,
  flat: boolean,
  settings: {},
  commonService: CommonService,
  coreServices: CoreStart
) {
  const result = await commonService.apiCaller({
    endpoint: "indices.putSettings",
    method: "PUT",
    data: {
      index: indexName,
      flat_settings: flat,
      body: {
        settings: {
          ...settings,
        },
      },
    },
  });
  if (result && result.ok) {
    coreServices.notifications.toasts.addSuccess(`Successfully update index setting for ${indexName}`);
  } else {
    const errorMessage = `There is a problem set index setting for ${indexName}, please check with Admin`;
    coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getAlias(aliasName: string, commonService: CommonService) {
  return await commonService.apiCaller<{ alias: string }[]>({
    endpoint: "cat.aliases",
    method: "GET",
    data: {
      format: "json",
      name: `${aliasName || ""}*`,
      expand_wildcards: "open",
    },
  });
}

export async function splitIndex(
  sourceIndex: String,
  targetIndex: String,
  settingsPayload: Required<IndexItem>["settings"],
  commonService: CommonService,
  coreServices: CoreStart
) {
  const { aliases, ...settings } = settingsPayload;
  const result = await commonService.apiCaller({
    endpoint: "indices.split",
    method: "PUT",
    data: {
      index: sourceIndex,
      target: targetIndex,
      body: {
        settings: {
          ...settings,
        },
        aliases,
      },
    },
  });

  if (result && result.ok) {
    coreServices.notifications.toasts.addSuccess(`Successfully submit split index request.`);
    return result;
  } else {
    const errorMessage = `There was a problem submit split index request, please check with admin`;
    coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

/*
 ** When splitting an index, the valid value of number_of_shards in the target index depends on the source index’s primary shards count:
 ** (1) If the source index’s primary shards count is equal to 1,
 **     then the valid value is an arbitrary number between 1 and 1024(includes 1 and 1024).
 ** (2) If the source index’s primary shards count is greater than 1,
 **     the valid value is obtained by continuously multiplying the source index’s primary shards count by 2
 **     as long as it's not larger than 1024.
 **     For example, if the source index has 3 primary shards, then all the valid value are 3,6,12,24,…,768.
 */
export function getSplitShardOptions(sourceShards: number) {
  const shardsSelectOptions = [];
  if (sourceShards == 1) {
    for (let i = 2; i <= 1024; i++) {
      shardsSelectOptions.push({
        label: i.toString(),
      });
    }
  } else {
    const SHARDS_HARD_LIMIT = 1024 / 2;
    let shardsLimit = sourceShards;
    for (let i = 1; shardsLimit <= SHARDS_HARD_LIMIT; i++) {
      shardsLimit = shardsLimit * 2;
      shardsSelectOptions.push({
        label: shardsLimit.toString(),
      });
    }
  }

  return shardsSelectOptions;
}
