/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import { GetPoliciesResponse, PutPolicyResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { DocumentPolicy, Policy } from "../../models/interfaces";

export default class PolicyService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getPolicies = async (queryObject: object): Promise<ServerResponse<GetPoliciesResponse>> => {
    const url = `..${NODE_API.POLICIES}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetPoliciesResponse>;
    return response;
  };

  putPolicy = async (
    policy: { policy: Policy },
    policyId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutPolicyResponse>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(policy) })) as ServerResponse<
      PutPolicyResponse
    >;
    return response;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentPolicy>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<DocumentPolicy>;
    return response;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.POLICIES}/${policyId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<boolean>;
    return response;
  };
}
