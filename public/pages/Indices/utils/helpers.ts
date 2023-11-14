/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import queryString from "query-string";
import { CoreStart } from "opensearch-dashboards/public";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { IndicesQueryParams } from "../models/interfaces";
import { IndexItem } from "../../../../models/interfaces";
import { ServerResponse } from "../../../../server/models/types";
import { CommonService } from "../../../services";
import { CatIndex } from "../../../../server/models/interfaces";
import { jobSchedulerInstance } from "../../../context/JobSchedulerContext";
import { OpenJobMetaData, RecoveryJobMetaData } from "../../../models/interfaces";
import { ListenType } from "../../../lib/JobScheduler";
import { getClusterInfo } from "../../../utils/helpers";

export function getURLQueryParams(location: { search: string }): IndicesQueryParams {
  const { from, size, search, sortField, sortDirection, showDataStreams } = queryString.parse(location.search);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

export async function openIndices(props: {
  indices: string[];
  commonService: CommonService;
  coreServices: CoreStart;
  jobConfig?: Partial<OpenJobMetaData>;
}) {
  const indexPayload = props.indices.join(",");
  const result = await props.commonService.apiCaller<{
    task: string;
  }>({
    endpoint: "transport.request",
    data: {
      method: "POST",
      path: `/${indexPayload}/_open?wait_for_completion=false`,
    },
  });

  if (result && result.ok) {
    const toast = `Successfully started opening ${indexPayload}.`;
    const toastInstance = props.coreServices.notifications.toasts.addSuccess(toast, {
      toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
    });
    const clusterInfo = await getClusterInfo({
      commonService: props.commonService,
    });
    await jobSchedulerInstance.addJob({
      type: ListenType.OPEN,
      extras: {
        clusterInfo,
        toastId: toastInstance.id,
        taskId: result.response?.task,
        indexes: props.indices,
      },
      interval: 3000,
      ...props.jobConfig,
    } as OpenJobMetaData);
  } else {
    props.coreServices.notifications.toasts.addDanger(result.error);
  }

  return result;
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

  if (result && result.ok && result.response.length === 1) {
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
  return await props.commonService.apiCaller<Array<{ alias: string }>>({
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
  sourceIndex: string;
  targetIndex: string;
  settingsPayload: Required<IndexItem>["settings"];
  commonService: CommonService;
  coreServices: CoreStart;
}) {
  const { aliases, ...settings } = props.settingsPayload;
  const result = await props.commonService.apiCaller<{
    task: string;
  }>({
    endpoint: "transport.request",
    data: {
      path: `/${props.sourceIndex}/_split/${props.targetIndex}?wait_for_completion=false`,
      method: "PUT",
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
    const clusterInfo = await getClusterInfo({
      commonService: props.commonService,
    });
    await jobSchedulerInstance.addJob({
      interval: 30000,
      extras: {
        clusterInfo,
        toastId: toastInstance.id,
        sourceIndex: props.sourceIndex,
        destIndex: props.targetIndex,
        taskId: result.response?.task,
      },
      type: ListenType.SPLIT,
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
  const MAX_SHARDS_NUMBER = 1024;
  const shardsSelectOptions = [];
  if (sourceShards === 1) {
    for (let i = 2; i <= MAX_SHARDS_NUMBER; i++) {
      shardsSelectOptions.push({
        label: i.toString(),
      });
    }
  } else {
    const SHARDS_HARD_LIMIT = MAX_SHARDS_NUMBER / 2;
    let shardsLimit = sourceShards;
    while (shardsLimit <= SHARDS_HARD_LIMIT) {
      shardsLimit = shardsLimit * 2;
      shardsSelectOptions.push({
        label: shardsLimit.toString(),
      });
    }
  }

  return shardsSelectOptions;
}
