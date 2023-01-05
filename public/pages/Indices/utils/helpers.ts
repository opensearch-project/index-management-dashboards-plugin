/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { IndicesQueryParams } from "../models/interfaces";
import { IndexItem } from "../../../../models/interfaces";
import { ServerResponse } from "../../../../server/models/types";
import { CommonService } from "../../../services";
import { CoreStart } from "opensearch-dashboards/public";
import { CatIndex } from "../../../../server/models/interfaces";
import { jobSchedulerInstance } from "../../../context/JobSchedulerContext";
import { RecoveryJobMetaData } from "../../../models/interfaces";

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

export async function openIndices(props: { indices: string[]; commonService: CommonService; coreServices: CoreStart }) {
  const result = await props.commonService.apiCaller({
    endpoint: "indices.open",
    data: {
      index: props.indices,
    },
  });
  if (result && result.ok) {
    props.coreServices.notifications.toasts.addSuccess(`Open [${props.indices}] successfully`);
  } else {
    const errorMessage = `There is a problem open index ${props.indices}, please check with Admin`;
    props.coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getIndexSettings(props: {
  indexName: string;
  flat: boolean;
  commonService: CommonService;
  coreServices: CoreStart;
}): Promise<Record<string, IndexItem>> {
  const result: ServerResponse<Record<string, IndexItem>> = await props.commonService.apiCaller({
    endpoint: "indices.getSettings",
    method: "GET",
    data: {
      index: props.indexName,
      flat_settings: props.flat,
    },
  });
  if (result && result.ok) {
    return result.response;
  } else {
    const errorMessage = `There is a problem getting index setting for ${props.indexName}, please check with Admin`;
    props.coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getSingleIndice(props: {
  indexName: string;
  commonService: CommonService;
  coreServices: CoreStart;
}): Promise<CatIndex> {
  const result = await props.commonService.apiCaller({
    endpoint: "cat.indices",
    method: "GET",
    data: {
      format: "json",
      index: [`${props.indexName || ""}`],
    },
  });

  if (result && result.ok && result.response.length == 1) {
    return result.response[0];
  } else {
    const errorMessage = `There is a problem getting index for ${props.indexName}, please check with Admin`;
    props.coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function setIndexSettings(props: {
  indexName: string;
  flat: boolean;
  settings: {};
  commonService: CommonService;
  coreServices: CoreStart;
}) {
  const result = await props.commonService.apiCaller({
    endpoint: "indices.putSettings",
    method: "PUT",
    data: {
      index: props.indexName,
      flat_settings: props.flat,
      body: {
        settings: {
          ...props.settings,
        },
      },
    },
  });
  if (result && result.ok) {
    props.coreServices.notifications.toasts.addSuccess(`Successfully update index setting for ${props.indexName}`);
  } else {
    const errorMessage = `There is a problem set index setting for ${props.indexName}, please check with Admin`;
    props.coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
    throw new Error(result?.error || errorMessage);
  }
}

export async function getAlias(props: { aliasName?: string; commonService: CommonService }) {
  return await props.commonService.apiCaller<{ alias: string }[]>({
    endpoint: "cat.aliases",
    method: "GET",
    data: {
      format: "json",
      name: `*${props.aliasName || ""}*`,
      s: "alias:desc",
    },
  });
}

export async function splitIndex(props: {
  sourceIndex: String;
  targetIndex: String;
  settingsPayload: Required<IndexItem>["settings"];
  commonService: CommonService;
  coreServices: CoreStart;
}) {
  const { aliases, ...settings } = props.settingsPayload;
  const result = await props.commonService.apiCaller({
    endpoint: "indices.split",
    method: "PUT",
    data: {
      index: props.sourceIndex,
      target: props.targetIndex,
      body: {
        settings: {
          ...settings,
        },
        aliases,
      },
    },
  });

  if (result && result.ok) {
    const toastInstance = props.coreServices.notifications.toasts.addSuccess(
      `Successfully started splitting ${props.sourceIndex}. The split index will be named ${props.targetIndex}`,
      {
        toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
      }
    );
    await jobSchedulerInstance.addJob({
      interval: 30000,
      extras: {
        toastId: toastInstance.id,
        sourceIndex: props.sourceIndex,
        destIndex: props.targetIndex,
      },
      type: "split",
    } as RecoveryJobMetaData);
    return result;
  } else {
    const errorMessage = `There was a problem submit split index request, please check with admin`;
    props.coreServices.notifications.toasts.addDanger(result?.error || errorMessage);
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
