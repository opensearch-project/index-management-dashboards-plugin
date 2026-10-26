/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import { RequestParams } from "@elastic/elasticsearch";
import {
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
} from "opensearch-dashboards/server";
import { INDEX } from "../utils/constants";
import { getSearchString, transformManagedIndexMetaData } from "../utils/helpers";
import {
  ChangePolicyResponse,
  ExplainAllResponse,
  ExplainAPIManagedIndexMetaData,
  GetManagedIndicesResponse,
  RemovePolicyResponse,
  RemoveResponse,
  RetryManagedIndexResponse,
  RetryParams,
  RetryResponse,
  SearchResponse,
} from "../models/interfaces";
import { ManagedIndicesSort, ServerResponse } from "../models/types";
import { ManagedIndexItem } from "../../models/interfaces";
import { getIndexToDataStreamMapping } from "./DataStreamService";
import { MDSEnabledClientService } from "./MDSEnabledClientService";
import { getManagedIndexJobStatus, JOB_STATUS_SORT_FIELD } from "../../utils/managedIndex";

// Matches the default index.max_result_window, the most the explain API can return in one request.
const MAX_SERVER_SORT_SIZE = 10000;

interface ExplainedIndex {
  metadata: ExplainAPIManagedIndexMetaData;
  parentDataStream: string | null;
}

// Sort fields the explain API can't sort by, mapped to the value to sort on.
const SERVER_SORTS: { [sortField: string]: ((explained: ExplainedIndex) => string) | undefined } = {
  [JOB_STATUS_SORT_FIELD]: ({ metadata }) => getManagedIndexJobStatus(transformManagedIndexMetaData(metadata)),
  dataStream: ({ parentDataStream }) => parentDataStream || "",
};

export default class ManagedIndexService extends MDSEnabledClientService {
  // TODO: Not finished, need UI page that uses this first
  getManagedIndex = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any>>> => {
    try {
      const { id } = request.params as { id: string };
      const params: RequestParams.Get = { id, index: INDEX.OPENDISTRO_ISM_CONFIG };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const results: SearchResponse<any> = (await callWithRequest("search", params)) as SearchResponse<any>;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: results,
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - getManagedIndex:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getManagedIndices = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetManagedIndicesResponse>>> => {
    try {
      const { from, size, sortDirection, sortField, terms, indices, dataStreams, showDataStreams } = request.query as {
        from: string;
        size: string;
        search: string;
        sortDirection: string;
        sortField: string;
        terms?: string[];
        indices?: string[];
        dataStreams?: string[];
        showDataStreams: boolean;
      };

      const managedIndexSorts: ManagedIndicesSort = { index: "managed_index.index", policyId: "managed_index.policy_id" };
      // Job status and data stream aren't fields on the managed index document, so the explain API can't sort by them.
      // Instead fetch all matching managed indices (up to the max result window), sort them here, and return the requested page.
      const getServerSortValue = SERVER_SORTS[sortField];
      const explainParams = {
        sortField: getServerSortValue ? managedIndexSorts.index : sortField ? managedIndexSorts[sortField] : null,
        sortOrder: getServerSortValue ? "asc" : sortDirection,
        queryString: getSearchString(terms, indices, dataStreams, showDataStreams),
        from: getServerSortValue ? 0 : from,
        size: getServerSortValue ? MAX_SERVER_SORT_SIZE : size,
      };

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const [explainAllResponse, indexToDataStreamMapping] = await Promise.all([
        callWithRequest("ism.explainAll", explainParams) as Promise<ExplainAllResponse>,
        getIndexToDataStreamMapping(callWithRequest),
      ]);
      let explainedIndices: ExplainedIndex[] = [];
      for (const indexName in explainAllResponse) {
        if (indexName == "total_managed_indices") continue;
        const metadata = explainAllResponse[indexName] as ExplainAPIManagedIndexMetaData;

        // If showDataStreams is not true, then skip the managed index if it belongs to a data stream.
        const parentDataStream = indexToDataStreamMapping[metadata.index] || null;
        if (!showDataStreams && parentDataStream !== null) continue;
        explainedIndices.push({ metadata, parentDataStream });
      }

      if (getServerSortValue) {
        const direction = sortDirection === "desc" ? -1 : 1;
        const pageStart = Number(from);
        explainedIndices = explainedIndices
          .map((explained) => ({ ...explained, sortValue: getServerSortValue(explained) }))
          // Array.prototype.sort is stable, so ties stay in index name order.
          .sort((a, b) => direction * a.sortValue.localeCompare(b.sortValue))
          .slice(pageStart, pageStart + Number(size));
      }

      const managedIndices: ManagedIndexItem[] = [];
      for (const { metadata, parentDataStream } of explainedIndices) {
        let policy, seqNo, primaryTerm, getResponse;
        try {
          getResponse = await callWithRequest("ism.getPolicy", { policyId: metadata.policy_id });
        } catch (err) {
          if (err.statusCode === 404 && err.body.error.reason === "Policy not found") {
            console.log("managed index with not existing policy");
          } else {
            throw err;
          }
        }
        policy = _.get(getResponse, "policy", null);
        seqNo = _.get(getResponse, "_seq_no", null);
        primaryTerm = _.get(getResponse, "_primary_term", null);
        managedIndices.push({
          index: metadata.index,
          indexUuid: metadata.index_uuid,
          dataStream: parentDataStream,
          policyId: metadata.policy_id,
          policySeqNo: seqNo,
          policyPrimaryTerm: primaryTerm,
          policy: policy,
          enabled: metadata.enabled,
          managedIndexMetaData: transformManagedIndexMetaData(metadata),
        });
      }

      let totalManagedIndices = explainAllResponse.total_managed_indices;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { managedIndices: managedIndices, totalManagedIndices: totalManagedIndices },
        },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { managedIndices: [], totalManagedIndices: 0 },
          },
        });
      }
      console.error("Index Management - ManagedIndexService - getManagedIndices", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  retryManagedIndexPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<RetryManagedIndexResponse>>> => {
    try {
      const { index, state = null } = request.body as { index: string[]; state?: string };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const params: RetryParams = { index: index.join(",") };
      if (state) params.body = { state };
      const retryResponse: RetryResponse = await callWithRequest("ism.retry", params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: retryResponse.failures,
            updatedIndices: retryResponse.updated_indices,
            // TODO: remove ternary after fixing retry API to return empty array even if no failures
            failedIndices: retryResponse.failed_indices
              ? retryResponse.failed_indices.map((failedIndex) => ({
                  indexName: failedIndex.index_name,
                  indexUuid: failedIndex.index_uuid,
                  reason: failedIndex.reason,
                }))
              : [],
          },
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - retryManagedIndexPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  changePolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<ChangePolicyResponse>>> => {
    try {
      const { indices, policyId, include, state } = request.body as {
        indices: string[];
        policyId: string;
        state: string | null;
        include: { state: string }[];
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const params = { index: indices.join(","), body: { policy_id: policyId, include, state } };
      const changeResponse: RemoveResponse = (await callWithRequest("ism.change", params)) as RemoveResponse;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            failures: changeResponse.failures,
            updatedIndices: changeResponse.updated_indices,
            failedIndices: changeResponse.failed_indices.map((failedIndex) => ({
              indexName: failedIndex.index_name,
              indexUuid: failedIndex.index_uuid,
              reason: failedIndex.reason,
            })),
          },
        },
      });
    } catch (err) {
      console.error("Index Management - ManagedIndexService - changePolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  removePolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<RemovePolicyResponse>>> => {
    try {
      const { indices } = request.body as { indices: string[] };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const params = { index: indices.join(",") };
      const addResponse: RemoveResponse = (await callWithRequest("ism.remove", params)) as RemoveResponse;
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
      console.error("Index Management - ManagedIndexService - removePolicy:", err);
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
