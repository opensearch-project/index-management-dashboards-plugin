/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { ServerResponse } from "../../server/models/types";
import { GetFieldsResponse, GetTransformsResponse, PreviewTransformResponse, PutTransformResponse } from "../../server/models/interfaces";
import { NODE_API } from "../../utils/constants";
import { DocumentTransform, Transform } from "../../models/interfaces";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class TransformService extends MDSEnabledClientService {
  getTransforms = async (queryObject?: HttpFetchQuery): Promise<ServerResponse<GetTransformsResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    // @ts-ignore
    return (await this.httpClient.get(url, params)) as ServerResponse<GetTransformsResponse>;
  };

  putTransform = async (
    transform: Transform,
    transformId: string,
    seqNo?: number,
    primaryTerm?: number
  ): Promise<ServerResponse<PutTransformResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    const query = this.patchQueryObjectWithDataSourceId({ seqNo, primaryTerm });
    const params = query ? { query } : {};
    return (await this.httpClient.put(url, { body: JSON.stringify(transform), ...params })) as ServerResponse<PutTransformResponse>;
  };

  getTransform = async (transformId: string): Promise<ServerResponse<DocumentTransform>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    return (await this.httpClient.get(url, params)) as ServerResponse<DocumentTransform>;
  };

  deleteTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    return (await this.httpClient.delete(url, params)) as ServerResponse<boolean>;
  };

  startTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_start`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    return (await this.httpClient.post(url, params)) as ServerResponse<boolean>;
  };

  stopTransform = async (transformId: string): Promise<ServerResponse<boolean>> => {
    const url = `..${NODE_API.TRANSFORMS}/${transformId}/_stop`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    return (await this.httpClient.post(url, params)) as ServerResponse<boolean>;
  };

  previewTransform = async (transform: any): Promise<ServerResponse<PreviewTransformResponse>> => {
    const url = `..${NODE_API.TRANSFORMS}/_preview`;
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    // @ts-ignore
    return (await this.httpClient.post(url, { body: JSON.stringify(transform), ...params })) as ServerResponse<PreviewTransformResponse>;
  };

  //Function to search for fields from a source index using GET /${source_index}/_mapping
  getMappings = async (index: string): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._MAPPINGS}`;
    const body = { index: index };
    const query = this.patchQueryObjectWithDataSourceId();
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, { body: JSON.stringify(body), ...params })) as ServerResponse<GetFieldsResponse>;
    return response;
  };

  searchSampleData = async (index: string, body: string, queryObject?: HttpFetchQuery): Promise<ServerResponse<any>> => {
    const url = `..${NODE_API._SEARCH_SAMPLE_DATA}/${index}`;
    const query = this.patchQueryObjectWithDataSourceId(queryObject);
    const params = query ? { query } : {};
    const response = (await this.httpClient.post(url, { body: body, ...params })) as ServerResponse<any>;
    return response;
  };
}
