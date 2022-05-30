/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { NODE_API } from "../../utils/constants";
import { GetSnapshotsResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";

export default class SnapshotManagementService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getSnapshots = async (queryObject: HttpFetchQuery): Promise<ServerResponse<GetSnapshotsResponse>> => {
    console.log(`sm dev query object: ${JSON.stringify(queryObject)}`);
    let url = `..${NODE_API._SNAPSHOTS}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetSnapshotsResponse>;
    console.log(`sm dev get snapshot response: ${JSON.stringify(response)}`);
    return response;
  };
}
