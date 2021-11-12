/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import {
  ChangePolicyResponse,
  GetDataStreamsResponse,
  GetManagedIndicesResponse,
  RemovePolicyResponse,
  RetryManagedIndexResponse,
} from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";

export default class ManagedIndexService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getManagedIndex = async (managedIndexUuid: string): Promise<ServerResponse<any>> => {
    const response = (await this.httpClient.get(`..${NODE_API.MANAGED_INDICES}/${managedIndexUuid}`)) as ServerResponse<any>;
    return response;
  };

  getManagedIndices = async (queryObject: object): Promise<ServerResponse<GetManagedIndicesResponse>> => {
    let url = `..${NODE_API.MANAGED_INDICES}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetManagedIndicesResponse>;
    return response;
  };

  getDataStreams = async (): Promise<ServerResponse<GetDataStreamsResponse>> => {
    const url = `..${NODE_API._DATA_STREAMS}`;
    return await this.httpClient.get(url);
  };

  retryManagedIndexPolicy = async (index: string[], state: string | null): Promise<ServerResponse<RetryManagedIndexResponse>> => {
    const body = { index, state };
    const response = (await this.httpClient.post(`..${NODE_API.RETRY}`, { body: JSON.stringify(body) })) as ServerResponse<
      RetryManagedIndexResponse
    >;
    return response;
  };

  removePolicy = async (indices: string[]): Promise<ServerResponse<RemovePolicyResponse>> => {
    const body = { indices };
    const response = (await this.httpClient.post(`..${NODE_API.REMOVE_POLICY}`, { body: JSON.stringify(body) })) as ServerResponse<
      RemovePolicyResponse
    >;
    return response;
  };

  changePolicy = async (
    indices: string[],
    policyId: string,
    state: string | null,
    include: object[]
  ): Promise<ServerResponse<ChangePolicyResponse>> => {
    const body = { indices, policyId, state, include };
    const response = (await this.httpClient.post(`..${NODE_API.CHANGE_POLICY}`, { body: JSON.stringify(body) })) as ServerResponse<
      ChangePolicyResponse
    >;
    return response;
  };
}
