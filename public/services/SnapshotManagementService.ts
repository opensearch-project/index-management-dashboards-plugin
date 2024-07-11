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
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class SnapshotManagementService extends MDSEnabledClientService {
  getAllSnapshotsWithPolicy = async (): Promise<ServerResponse<GetSnapshotsResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetSnapshotsResponse>;
    return response;
  };

  getSnapshot = async (snapshotId: string, repository: string): Promise<ServerResponse<GetSnapshot>> => {
    let url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const query = this.patchQueryObjectWithDataSourceId({ repository });
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetSnapshot>;
    return response;
  };

  deleteSnapshot = async (snapshotId: string, repository: string): Promise<ServerResponse<AcknowledgedResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const query = this.patchQueryObjectWithDataSourceId({ repository });
    const params = query ? { query } : {};
    const response = (await this.httpClient.delete(url, params)) as ServerResponse<AcknowledgedResponse>;
    return response;
  };

  createSnapshot = async (snapshotId: string, repository: string, snapshot: Snapshot): Promise<ServerResponse<CreateSnapshotResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const query = this.patchQueryObjectWithDataSourceId({ repository });
    const params = query ? { query } : {};
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(snapshot),
      ...params,
    })) as ServerResponse<CreateSnapshotResponse>;
    return response;
  };

  restoreSnapshot = async (snapshotId: string, repository: string, options: object): Promise<ServerResponse<RestoreSnapshotResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}/${snapshotId}`;
    const query = this.patchQueryObjectWithDataSourceId({ repository });
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(options),
      ...params,
    })) as ServerResponse<RestoreSnapshotResponse>;
    return response;
  };

  getIndexRecovery = async (): Promise<ServerResponse<GetIndexRecoveryResponse>> => {
    const url = NODE_API._RECOVERY;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetIndexRecoveryResponse>;
    return response;
  };

  createPolicy = async (policyId: string, policy: SMPolicy): Promise<ServerResponse<DocumentSMPolicy>> => {
    let url = `..${NODE_API.SMPolicies}/${policyId}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, { body: JSON.stringify(policy), ...params })) as ServerResponse<DocumentSMPolicy>;
    return response;
  };

  updatePolicy = async (
    policyId: string,
    policy: SMPolicy,
    seqNo: number,
    primaryTerm: number
  ): Promise<ServerResponse<DocumentSMPolicy>> => {
    let url = `..${NODE_API.SMPolicies}/${policyId}`;
    const query = this.patchQueryObjectWithDataSourceId({ seqNo, primaryTerm });
    const params = query ? { query } : {};
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(policy),
      ...params,
    })) as ServerResponse<DocumentSMPolicy>;
    return response;
  };

  getPolicies = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetSMPoliciesResponse>> => {
    let url = `..${NODE_API.SMPolicies}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<GetSMPoliciesResponse>;
    return response;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<DocumentSMPolicyWithMetadata>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<DocumentSMPolicyWithMetadata>;
    return response;
  };

  deletePolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    const response = (await this.httpClient.delete(url, params)) as ServerResponse<boolean>;
    return response;
  };

  startPolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}/_start`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, params)) as ServerResponse<boolean>;
    return response;
  };

  stopPolicy = async (policyId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.SMPolicies}/${policyId}/_stop`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, params)) as ServerResponse<boolean>;
    return response;
  };

  catRepositories = async (): Promise<ServerResponse<CatRepository[]>> => {
    const url = `..${NODE_API._REPOSITORIES}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url, params)) as ServerResponse<CatRepository[]>;
    return response;
  };

  catSnapshotIndices = async (indices: string): Promise<ServerResponse<CatIndex[]>> => {
    const url = `..${NODE_API._INDICES}/${indices}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url)) as ServerResponse<CatIndex[]>;
    return response;
  };

  getRepository = async (repo: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.get(url)) as ServerResponse<any>;
    return response;
  };

  createRepository = async (repo: string, createRepoBody: CreateRepositoryBody): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.put(url, { body: JSON.stringify(createRepoBody), ...params })) as ServerResponse<any>;
    return response;
  };

  deleteRepository = async (repo: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._REPOSITORIES}/${repo}`;
    const query = this.patchQueryObjectWithDataSourceId({});
    const params = query ? { query } : {};
    const response = (await this.httpClient.delete(url, params)) as ServerResponse<any>;
    return response;
  };
}
