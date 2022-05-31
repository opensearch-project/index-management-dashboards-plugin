/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { NODE_API } from "../../utils/constants";
import { CreateSMPolicyResponse, GetSnapshotsResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { SMPolicy } from "../../models/interfaces";

export default class SnapshotManagementService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getSnapshots = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetSnapshotsResponse>> => {
    let url = `..${NODE_API._SNAPSHOTS}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetSnapshotsResponse>;
    return response;
  };

  createPolicy = async (id: string, policy: SMPolicy): Promise<ServerResponse<CreateSMPolicyResponse>> => {
    let url = `..${NODE_API.SMPolicies}/${id}`;
    const response = (await this.httpClient.post(url, { body: JSON.stringify(policy) })) as ServerResponse<CreateSMPolicyResponse>;
    console.log(`sm dev public create sm policy response ${JSON.stringify(response)}`);
    return response;
  };
}
