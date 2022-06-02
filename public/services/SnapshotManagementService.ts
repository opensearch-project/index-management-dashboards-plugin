/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { NODE_API } from "../../utils/constants";
import { CreateSMPolicyResponse, CatSnapshotsResponse, GetSMPoliciesResponse, GetSnapshot } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { DocumentSMPolicy, SMPolicy } from "../../models/interfaces";

export default class SnapshotManagementService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getSnapshots = async (): Promise<ServerResponse<CatSnapshotsResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<CatSnapshotsResponse>;
    return response;
  };

  getSnapshot = async (snapshotId: string): Promise<ServerResponse<GetSnapshot>> => {
    let url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetSnapshot>;
    return response;
  };

  createPolicy = async (policyId: string, policy: SMPolicy): Promise<ServerResponse<CreateSMPolicyResponse>> => {
    let url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.post(url, { body: JSON.stringify(policy) })) as ServerResponse<CreateSMPolicyResponse>;
    console.log(`sm dev public create sm policy response ${JSON.stringify(response)}`);
    return response;
  };

  updatePolicy = async (
    policyId: string,
    policy: SMPolicy,
    seqNo: number,
    primaryTerm: number
  ): Promise<ServerResponse<CreateSMPolicyResponse>> => {
    let url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(policy) })) as ServerResponse<
      CreateSMPolicyResponse
    >;
    console.log(`sm dev public update sm policy response ${JSON.stringify(response)}`);
    return response;
  };

  getPolicies = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetSMPoliciesResponse>> => {
    let url = `..${NODE_API.SMPolicies}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetSMPoliciesResponse>;
    console.log(`sm dev public get sm policies response ${JSON.stringify(response)}`);
    return response;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentSMPolicy>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<DocumentSMPolicy>;
    return response;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<boolean>;
    return response;
  };
}
