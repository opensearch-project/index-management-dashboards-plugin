/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery } from "opensearch-dashboards/public";
import {
  AcknowledgedResponse,
  ApplyPolicyResponse,
  DataStream,
  GetAliasesResponse,
  GetDataStreamsAndIndicesNamesResponse,
  GetDataStreamsResponse,
  GetIndicesResponse,
  GetPoliciesResponse,
} from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { IndexItem } from "../../models/interfaces";
import { SECURITY_EXCEPTION_PREFIX } from "../../server/utils/constants";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class IndexService extends MDSEnabledClientService {
  getIndices = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetIndicesResponse>> => {
    let url = `..${NODE_API._INDICES}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    return (await this.httpClient.get(url, params)) as ServerResponse<GetIndicesResponse>;
  };

  getDataStreams = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetDataStreamsResponse>> => {
    const url = `..${NODE_API._DATA_STREAMS}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    return await this.httpClient.get(url, params);
  };

  getAliases = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetAliasesResponse>> => {
    const url = `..${NODE_API._ALIASES}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    return await this.httpClient.get(url, params);
  };

  getDataStreamsAndIndicesNames = async (searchValue: string): Promise<ServerResponse<GetDataStreamsAndIndicesNamesResponse>> => {
    const [getIndicesResponse, getDataStreamsResponse] = await Promise.all([
      this.getIndices({
        from: 0,
        size: 10,
        search: searchValue,
        terms: [searchValue],
        sortDirection: "desc",
        sortField: "index",
        showDataStreams: true,
      }),
      this.getDataStreams({ search: searchValue }),
    ]);

    if (!getIndicesResponse.ok) {
      return {
        ok: false,
        error: getIndicesResponse.error,
      };
    }

    if (!getDataStreamsResponse.ok) {
      // Data stream security exception shouldn't block this call totally
      if (getDataStreamsResponse.error.startsWith(SECURITY_EXCEPTION_PREFIX)) {
        return {
          ok: true,
          response: {
            dataStreams: [],
            indices: getIndicesResponse.response.indices.map((index: IndexItem) => index.index),
          },
        };
      }
      return {
        ok: false,
        error: getDataStreamsResponse.error,
      };
    }

    return {
      ok: true,
      response: {
        dataStreams: getDataStreamsResponse.response.dataStreams.map((ds: DataStream) => ds.name),
        indices: getIndicesResponse.response.indices.map((index: IndexItem) => index.index),
      },
    };
  };

  applyPolicy = async (indices: string[], policyId: string, queryObject?: HttpFetchQuery): Promise<ServerResponse<ApplyPolicyResponse>> => {
    const body = { indices, policyId };
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const url = `..${NODE_API.APPLY_POLICY}`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify(body),
      ...params,
    })) as ServerResponse<ApplyPolicyResponse>;
  };

  editRolloverAlias = async (index: string, alias: string, queryObject?: HttpFetchQuery): Promise<ServerResponse<AcknowledgedResponse>> => {
    const body = { index, alias };
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const url = `..${NODE_API.EDIT_ROLLOVER_ALIAS}`;
    return (await this.httpClient.post(url, {
      body: JSON.stringify(body),
      ...params,
    })) as ServerResponse<AcknowledgedResponse>;
  };

  searchPolicies = async (searchValue: string, source: boolean = false): Promise<ServerResponse<GetPoliciesResponse>> => {
    const str = searchValue.trim();
    const query = this.patchQueryObjectWithDataSourceId({ from: 0, size: 10, search: str, sortDirection: "desc", sortField: "id" });
    const params = query ? { query } : {};
    const url = `..${NODE_API.POLICIES}`;
    return (await this.httpClient.get(url, params)) as ServerResponse<GetPoliciesResponse>;
  };
}
