/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { NODE_API } from "../../utils/constants";
import { ServerResponse } from "../../server/models/types";

export default class SnapshotManagementService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getSnapshots = async (): Promise<ServerResponse<any>> => {
    const response = await this.httpClient.get(`${NODE_API.SNAPSHOTMANAGEMENT}`);
    console.log(`sm dev get snapshot response: ${JSON.stringify(response)}`);
    return response;
  };
}
