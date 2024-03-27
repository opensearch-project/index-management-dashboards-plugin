/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import {
  ChangePolicyResponse,
  GetDataStreamsResponse,
  GetManagedIndicesResponse,
  RemovePolicyResponse,
  RetryManagedIndexResponse,
} from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class ManagedIndexService extends MDSEnabledClientService {
  getManagedIndex = async (managedIndexUuid: string, queryObject: HttpFetchQuery | undefined): Promise<ServerResponse<any>> => {
    let url = `..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<any>;
    return response;
  };

  getManagedIndices = async (queryObject: HttpFetchQuery | undefined): Promise<ServerResponse<GetManagedIndicesResponse>> => {
    let url = `..${NODE_API.MANAGED_INDICES}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetManagedIndicesResponse>;
    return response;
  };

  getDataStreams = async (queryObject: HttpFetchQuery | undefined): Promise<ServerResponse<GetDataStreamsResponse>> => {
    let url = `..${NODE_API._DATA_STREAMS}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetDataStreamsResponse>;
    return response;
  };

  retryManagedIndexPolicy = async (
    index: string[],
    state: string | null,
    queryObject: HttpFetchQuery | undefined
  ): Promise<ServerResponse<RetryManagedIndexResponse>> => {
    const body = { index, state };
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(`..${NODE_API.RETRY}`, {
      body: JSON.stringify(body),
      ...params,
    })) as ServerResponse<RetryManagedIndexResponse>;
    return response;
  };

  removePolicy = async (indices: string[], queryObject: HttpFetchQuery | undefined): Promise<ServerResponse<RemovePolicyResponse>> => {
    const body = { indices };
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(`..${NODE_API.REMOVE_POLICY}`, {
      body: JSON.stringify(body),
      ...params,
    })) as ServerResponse<RemovePolicyResponse>;
    return response;
  };

  changePolicy = async (
    indices: string[],
    policyId: string,
    state: string | null,
    include: object[],
    queryObject?: HttpFetchQuery | undefined
  ): Promise<ServerResponse<ChangePolicyResponse>> => {
    const body = { indices, policyId, state, include };
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(`..${NODE_API.CHANGE_POLICY}`, {
      body: JSON.stringify(body),
      ...params,
    })) as ServerResponse<ChangePolicyResponse>;
    return response;
  };
}
