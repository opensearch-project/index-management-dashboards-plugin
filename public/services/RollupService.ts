/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import { PutRollupResponse, GetRollupsResponse, GetFieldsResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { DocumentRollup, Rollup } from "../../models/interfaces";

export default class RollupService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getRollups = async (queryObject: object): Promise<ServerResponse<GetRollupsResponse>> => {
    let url = `..${NODE_API.ROLLUPS}`;
    const response = (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetRollupsResponse>;
    return response;
  };

  putRollup = async (
    rollup: Rollup,
    rollupId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutRollupResponse>> => {
    let url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    const response = (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(rollup) })) as ServerResponse<
      PutRollupResponse
    >;
    return response;
  };

  getRollup = async (rollupId: string): Promise<ServerResponse<DocumentRollup>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    const response = (await this.httpClient.get(url)) as ServerResponse<DocumentRollup>;
    return response;
  };

  deleteRollup = async (rollupId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}`;
    const response = (await this.httpClient.delete(url)) as ServerResponse<boolean>;
    return response;
  };

  startRollup = async (rollupId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}/_start`;
    const response = (await this.httpClient.post(url)) as ServerResponse<boolean>;
    return response;
  };

  stopRollup = async (rollupId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.ROLLUPS}/${rollupId}/_stop`;
    const response = (await this.httpClient.post(url)) as ServerResponse<boolean>;
    return response;
  };

  //Function to search for fields from a source index using GET /${source_index}/_mapping
  getMappings = async (index: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._MAPPINGS}`;
    const body = { index: index };
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body) })) as ServerResponse<GetFieldsResponse>;
    return response;
  };
}
