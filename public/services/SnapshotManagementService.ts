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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { NODE_API } from "../../utils/constants";
import {
  GetSnapshotsResponse,
  GetSMPoliciesResponse,
  GetSnapshot,
  CatRepository,
  CatIndex,
  CreateRepositoryBody,
  AcknowledgedResponse,
  CreateSnapshotResponse,
  RestoreSnapshotResponse,
  GetIndexRecoveryResponse,
} from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { DocumentSMPolicy, DocumentSMPolicyWithMetadata, SMPolicy, Snapshot } from "../../models/interfaces";

export default class SnapshotManagementService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getAllSnapshotsWithPolicy = async (): Promise<ServerResponse<GetSnapshotsResponse>> => {
    const url = `..${NODE_API._SNAPSHOTS}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetSnapshotsResponse>;
    return response;
  };

  getSnapshot = async (snapshotId: string, repository: string): Promise<ServerResponse<GetSnapshot>> => {
    const url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const response = (await this.httpClient.get(url, { query: { repository } })) as ServerResponse<GetSnapshot>;
    return response;
  };

  deleteSnapshot = async (snapshotId: string, repository: string): Promise<ServerResponse<AcknowledgedResponse>> => {
    const url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const response = (await this.httpClient.delete(url, { query: { repository } })) as ServerResponse<AcknowledgedResponse>;
    return response;
  };

  createSnapshot = async (snapshotId: string, repository: string, snapshot: Snapshot): Promise<ServerResponse<CreateSnapshotResponse>> => {
    const url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const response = (await this.httpClient.put(url, {
      query: { repository },
      body: JSON.stringify(snapshot),
    })) as ServerResponse<CreateSnapshotResponse>;
    return response;
  };

  restoreSnapshot = async (snapshotId: string, repository: string, options: object): Promise<ServerResponse<RestoreSnapshotResponse>> => {
    const url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const response = (await this.httpClient.post(url, {
      query: { repository },
      body: JSON.stringify(options),
    })) as ServerResponse<RestoreSnapshotResponse>;
    return response;
  };

  getIndexRecovery = async (): Promise<ServerResponse<GetIndexRecoveryResponse>> => {
    const url = NODE_API._RECOVERY;
    const response = (await this.httpClient.get(url)) as ServerResponse<GetIndexRecoveryResponse>;
    return response;
  };

  createPolicy = async (policyId: string, policy: SMPolicy): Promise<ServerResponse<DocumentSMPolicy>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.post(url, { body: JSON.stringify(policy) })) as ServerResponse<DocumentSMPolicy>;
    return response;
  };

  updatePolicy = async (
    policyId: string,
    policy: SMPolicy,
    seqNo: number,
    primaryTerm: number
  ): Promise<ServerResponse<DocumentSMPolicy>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.put(url, {
      query: { seqNo, primaryTerm },
      body: JSON.stringify(policy),
    })) as ServerResponse<DocumentSMPolicy>;
    return response;
  };

  getPolicies = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetSMPoliciesResponse>> => {
    const url = `..${NODE_API.SMPolicies}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetSMPoliciesResponse>;
    return response;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentSMPolicyWithMetadata>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<DocumentSMPolicyWithMetadata>;
    return response;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<boolean>;
    return response;
  };

  startPolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}/_start`;
    const response = (await this.httpClient.post(url)) as ServerResponse<boolean>;
    return response;
  };

  stopPolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}/_stop`;
    const response = (await this.httpClient.post(url)) as ServerResponse<boolean>;
    return response;
  };

  catRepositories = async (): Promise<ServerResponse<CatRepository[]>> => {
    const url = `..${NODE_API._REPOSITORIES}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<CatRepository[]>;
    return response;
  };

  catSnapshotIndices = async (indices: string): Promise<ServerResponse<CatIndex[]>> => {
    const url = `..${NODE_API._INDICES}/${indices}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<CatIndex[]>;
    return response;
  };

  getRepository = async (repo: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<any>;
    return response;
  };

  createRepository = async (repo: string, createRepoBody: CreateRepositoryBody): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const response = (await this.httpClient.put(url, { body: JSON.stringify(createRepoBody) })) as ServerResponse<any>;
    return response;
  };

  deleteRepository = async (repo: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<any>;
    return response;
  };
}
