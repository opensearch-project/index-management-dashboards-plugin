/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Setting } from "../utils/constants";
import {
  AcknowledgedResponse,
  ApplyPolicyResponse,
  AddResponse,
  CatIndex,
  GetIndicesResponse,
  ExplainResponse,
  ExplainAPIManagedIndexMetaData,
  IndexToDataStream,
} from "../models/interfaces";
import { ServerResponse } from "../models/types";
import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
  LegacyCallAPIOptions,
} from "../../../../src/core/server";
import { getClientBasedOnDataSource, getSearchString } from "../utils/helpers";
import { getIndexToDataStreamMapping } from "./DataStreamService";
import { IRecoveryItem, IReindexItem, ITaskItem } from "../../models/interfaces";

export default class IndexService {
  osDriver: ILegacyCustomClusterClient;
  dataSourceEnabled: boolean;

  constructor(osDriver: ILegacyCustomClusterClient, dataSourceEnabled: boolean = false) {
    this.osDriver = osDriver;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  getIndices = async (
    context: any,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetIndicesResponse>>> => {
    try {
      // @ts-ignore
      const {
        from,
        size,
        sortField,
        sortDirection,
        terms,
        indices,
        dataStreams,
        showDataStreams,
        expandWildcards,
        exactSearch,
        dataSourceId = "",
      } = request.query as {
        from: string;
        size: string;
        search: string;
        sortField: string;
        sortDirection: string;
        terms?: string[];
        indices?: string[];
        dataStreams?: string[];
        showDataStreams: boolean;
        expandWildcards?: string;
        exactSearch?: string;
        dataSourceId?: string;
      };
      const params: {
        index: string;
        format: string;
        s?: string;
        expand_wildcards?: string;
      } = {
        index: getSearchString(terms, indices, dataStreams),
        format: "json",
      };

      if (sortField !== "managed" && sortField !== "data_stream") {
        params.s = `${sortField}:${sortDirection}`;
      }

      if (expandWildcards) {
        params.expand_wildcards = expandWildcards;
      }

      if (exactSearch) {
        params.index = exactSearch;
      }

      const callWithRequest = getClientBasedOnDataSource(context, this.dataSourceEnabled, request, dataSourceId, this.osDriver);

      const [recoverys, tasks, indicesResponse, indexToDataStreamMapping]: [
        IRecoveryItem[],
        ITaskItem[],
        CatIndex[],
        IndexToDataStream
      ] = await Promise.all([
        callWithRequest("cat.recovery", {
          format: "json",
          detailed: true,
        }).catch(() => []),
        callWithRequest("cat.tasks", {
          format: "json",
          detailed: true,
          actions: "indices:data/write/reindex",
        }).catch(() => []),
        callWithRequest("cat.indices", params),
        getIndexToDataStreamMapping({ callAsCurrentUser: callWithRequest }),
      ]);

      const formattedTasks: IReindexItem[] = tasks.map(
        (item): IReindexItem => {
          const { description } = item;
          const regexp = /reindex from \[([^\]]+)\] to \[([^\]]+)\]/i;
          const matchResult = description.match(regexp);
          if (matchResult) {
            const [, fromIndex, toIndex] = matchResult;
            return { ...item, fromIndex, toIndex };
          } else {
            return {
              ...item,
              fromIndex: "",
              toIndex: "",
            };
          }
        }
      );

      const onGoingRecovery = recoverys.filter((item) => item.stage !== "done");

      // Augment the indices with their parent data stream name.
      indicesResponse.forEach((index) => {
        index.data_stream = indexToDataStreamMapping[index.index] || null;
        let extraStatus: CatIndex["extraStatus"] = index.status as "open" | "close";
        if (index.health === "green") {
          if (formattedTasks.find((item) => item.toIndex === index.index)) {
            extraStatus = "reindex";
          }
        } else {
          if (onGoingRecovery.find((item) => item.index === index.index)) {
            extraStatus = "recovery";
          }
        }

        if (extraStatus) {
          index.extraStatus = extraStatus;
        }
      });

      function customSort(array, key, sortDirection) {
        return array.sort((a, b) => {
          let flag;
          const aValue = a[key] as string;
          const bValue = b[key] as string;

          if (sortDirection === "asc") {
            flag = aValue < bValue;
          } else {
            flag = aValue > bValue;
          }

          return flag ? -1 : 1;
        });
      }

      if (sortField === "status") {
        // add new more status to status field so we need to sort
        customSort(indicesResponse, "extraStatus", sortDirection);
      }

      // Filtering out indices that belong to a data stream. This must be done before pagination.
      const filteredIndices = showDataStreams ? indicesResponse : indicesResponse.filter((index) => index.data_stream === null);

      // _cat doesn't support pagination, do our own in server pagination to at least reduce network bandwidth
      const fromNumber = parseInt(from, 10);
      const sizeNumber = parseInt(size, 10);
      const paginatedIndices = filteredIndices.slice(fromNumber, fromNumber + sizeNumber);
      const indexNames = paginatedIndices.map((value: CatIndex) => value.index);

      const managedStatus = await this._getManagedStatus(callWithRequest, indexNames);

      const allIndices = paginatedIndices.map((catIndex: CatIndex) => ({
        ...catIndex,
        managed: managedStatus[catIndex.index] ? "Yes" : "No",
        managedPolicy: managedStatus[catIndex.index],
      }));

      // NOTE: Cannot use response.ok due to typescript type checking
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            indices: sortField === "managed" ? customSort(allIndices, "managed", sortDirection) : allIndices,
            totalIndices: filteredIndices.length,
          },
        },
      });
    } catch (err) {
      // Throws an error if there is no index matching pattern
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: {
              indices: [],
              totalIndices: 0,
            },
          },
        });
      }
      console.error("Index Management - IndexService - getIndices:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  _getManagedStatus = async (
    callWithRequest: (endpoint: string, clientParams?: Record<string, any>, options?: LegacyCallAPIOptions) => any,
    indexNames: string[]
  ): Promise<{ [p: string]: string }> => {
    try {
      const explainParamas = { index: indexNames.toString() };
      const explainResponse: ExplainResponse = await callWithRequest("ism.explain", explainParamas);
      const managed: { [indexName: string]: string } = {};
      for (const indexName in explainResponse) {
        if (indexName === "total_managed_indices") continue;
        const explain = explainResponse[indexName] as ExplainAPIManagedIndexMetaData;
        managed[indexName] =
          explain["index.plugins.index_state_management.policy_id"] === null
            ? ""
            : explain["index.plugins.index_state_management.policy_id"];
      }

      return managed;
    } catch (err) {
      // otherwise it could be an unauthorized access error to config index or some other error
      // in which case we will return managed status N/A
      console.error("Index Management - IndexService - _getManagedStatus:", err);
      return indexNames.reduce((accu, value) => ({ ...accu, [value]: "N/A" }), {});
    }
  };

  applyPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<ApplyPolicyResponse>>> => {
    try {
      const { indices, policyId } = request.body as { indices: string[]; policyId: string };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const params = { index: indices.join(","), body: { policy_id: policyId } };

      const addResponse: AddResponse = await callWithRequest("ism.add", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: addResponse.failures,
            updatedIndices: addResponse.updated_indices,
            failedIndices: addResponse.failed_indices.map((failedIndex) => ({
              indexName: failedIndex.index_name,
              indexUuid: failedIndex.index_uuid,
              reason: failedIndex.reason,
            })),
          },
        },
      });
    } catch (err) {
      console.error("Index Management - IndexService - applyPolicy:", err);
      // return { ok: false, error: err.message };
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  editRolloverAlias = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    try {
      const { alias, index } = request.body as { alias: string; index: string };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const params = { index, body: { [Setting.RolloverAlias]: alias } };
      const rollOverResponse = await callWithRequest("indices.putSettings", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: rollOverResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - IndexService - editRolloverAlias", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
