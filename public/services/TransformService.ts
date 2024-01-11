/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import { ServerResponse } from "../../server/models/types";
import { GetFieldsResponse, GetTransformsResponse, PreviewTransformResponse, PutTransformResponse } from "../../server/models/interfaces";
import { NODE_API } from "../../utils/constants";
import { DocumentTransform, Transform } from "../../models/interfaces";

export default class TransformService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  getTransforms = async (queryObject: object): Promise<ServerResponse<GetTransformsResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}`;
    // @ts-ignore
    return (await this.httpClient.get(url, { query: queryObject })) as ServerResponse<GetTransformsResponse>;
  };

  putTransform = async (
    transform: Transform,
    transformId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutTransformResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.put(url, { query: { seqNo, primaryTerm }, body: JSON.stringify(transform) })) as ServerResponse<
      PutTransformResponse
    >;
  };

  getTransform = async (transformId: string): Promise<ServerResponse<DocumentTransform>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.get(url)) as ServerResponse<DocumentTransform>;
  };

  deleteTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    return (await this.httpClient.delete(url)) as ServerResponse<boolean>;
  };

  startTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_start`;
    return (await this.httpClient.post(url)) as ServerResponse<boolean>;
  };

  stopTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_stop`;
    return (await this.httpClient.post(url)) as ServerResponse<boolean>;
  };

  previewTransform = async (transform: any): Promise<ServerResponse<PreviewTransformResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}/_preview`;
    // @ts-ignore
    return (await this.httpClient.post(url, { body: JSON.stringify(transform) })) as ServerResponse<PreviewTransformResponse>;
  };

  // Function to search for fields from a source index using GET /${source_index}/_mapping
  getMappings = async (index: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._MAPPINGS}`;
    const body = { index };
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body) })) as ServerResponse<GetFieldsResponse>;
    return response;
  };

  searchSampleData = async (index: string, queryObject: object, body: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._SEARCH_SAMPLE_DATA}/${index}`;
    const response = (await this.httpClient.post(url, { query: queryObject, body })) as ServerResponse<any>;
    return response;
  };
}
