/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import {
  RequestHandlerContext,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ILegacyCustomClusterClient,
  ILegacyScopedClusterClient,
} from "opensearch-dashboards/server";
import { ServerResponse } from "../models/types";
import { DataStream, GetDataStreamsResponse } from "../models/interfaces";

export default class DataStreamService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getDataStreams = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetDataStreamsResponse>>> => {
    try {
      const client = this.osDriver.asScoped(request);
      const dataStreams = await getDataStreams(client);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            dataStreams: dataStreams,
            totalDataStreams: dataStreams.length,
          },
        },
      });
    } catch (err) {
      console.error("Index Management - DataStreamService - getDataStreams:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}

export async function getDataStreams({ callAsCurrentUser: callWithRequest }: ILegacyScopedClusterClient): Promise<DataStream[]> {
  const dataStreamsResponse = await callWithRequest("transport.request", {
    path: "/_data_stream",
    method: "GET",
  });

  return dataStreamsResponse["data_streams"];
}

export async function getIndexToDataStreamMapping({
  callAsCurrentUser: callWithRequest,
}: ILegacyScopedClusterClient): Promise<{ [indexName: string]: string }> {
  const dataStreams: DataStream[] = await getDataStreams({ callAsCurrentUser: callWithRequest });

  const mapping: { [indexName: string]: string } = {};
  dataStreams.forEach((dataStream) => {
    dataStream.indices.forEach((index) => {
      mapping[index.index_name] = dataStream.name;
    });
  });

  return mapping;
}
