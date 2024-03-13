/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  ILegacyScopedClusterClient,
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from "opensearch-dashboards/server";
import { ServerResponse } from "../models/types";
import { DataStream, GetDataStreamsResponse, IndexToDataStream } from "../models/interfaces";
import { SECURITY_EXCEPTION_PREFIX } from "../utils/constants";
import { IAPICaller } from "../../models/interfaces";
import { getClientBasedOnDataSource } from "../utils/helpers";

export default class DataStreamService {
  osDriver: ILegacyCustomClusterClient;
  dataSourceEnabled: boolean;

  constructor(osDriver: ILegacyCustomClusterClient, dataSourceEnabled: boolean = false) {
    this.osDriver = osDriver;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  getDataStreams = async (
    context: any,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetDataStreamsResponse>>> => {
    try {
      const { search } = request.query as {
        search?: string;
      };

      const useQuery = !request.body;
      const usedParam = useQuery ? request.query : request.body;
      const { dataSourceId = "" } = usedParam || {};
      const callWithRequest = getClientBasedOnDataSource(context, this.dataSourceEnabled, request, dataSourceId, this.osDriver);
      const [dataStreams, apiAccessible, errMsg] = await getDataStreams(callWithRequest, search);

      if (!apiAccessible)
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: errMsg,
          },
        });

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

export async function getDataStreams(callWithRequest: any, search?: string): Promise<[DataStream[], boolean, string]> {
  const searchPattern = search ? `*${search}*` : "*";

  let accessible = true;
  let errMsg = "";
  const dataStreamsResponse = await callWithRequest("transport.request", {
    path: `/_data_stream/${searchPattern}`,
    method: "GET",
  }).catch((e) => {
    if (e.statusCode === 403 && e.message.startsWith(SECURITY_EXCEPTION_PREFIX)) {
      accessible = false;
      errMsg = e.message;
      return { data_streams: [] };
    }
    throw e;
  });

  return [dataStreamsResponse["data_streams"], accessible, errMsg];
}

export async function getIndexToDataStreamMapping({
  callAsCurrentUser: callWithRequest,
}: ILegacyScopedClusterClient): Promise<IndexToDataStream> {
  const [dataStreams] = await getDataStreams(callWithRequest);

  const mapping: { [indexName: string]: string } = {};
  dataStreams.forEach((dataStream) => {
    dataStream.indices.forEach((index) => {
      mapping[index.index_name] = dataStream.name;
    });
  });

  return mapping;
}
