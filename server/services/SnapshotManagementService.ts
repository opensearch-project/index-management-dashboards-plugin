/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from "../../../../src/core/server";
import { ServerResponse } from "../models/types";

export default class SnapshotManagementService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  getSnapshots = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any>>> => {
    const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
    const catSnapshotsRes: any = await callWithRequest("cat.snapshots", {
      repository: "repo",
      format: "json",
    });
    console.log(`cat snapshot response: ${JSON.stringify(catSnapshotsRes)}`);
    return response.custom({
      statusCode: 200,
      body: {
        ok: true,
        response: catSnapshotsRes,
      },
    });
  };
}
