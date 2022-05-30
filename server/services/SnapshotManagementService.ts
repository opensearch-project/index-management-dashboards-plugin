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
import { CatRepository, CatSnapshot, GetSnapshotsResponse } from "../models/interfaces";
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
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSnapshotsResponse>>> => {
    try {
      const { from, size, sortField, sortDirection } = request.query;
      // if no repository input, we need to first get back all repositories
      const getRepositoryRes = await this.getRepositories(context, request, response);
      const repositories = getRepositoryRes.payload?.response.map((repo) => repo.id).join();
      console.log(`sm dev get repositories ${JSON.stringify(repositories)}`);

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const params = {
        format: "json",
        repository: repositories,
      };
      const catSnapshotsRes: CatSnapshot[] = await callWithRequest("cat.snapshots", params);
      console.log(`sm dev cat snapshot response: ${JSON.stringify(catSnapshotsRes)}`);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            snapshots: catSnapshotsRes,
            totalSnapshots: catSnapshotsRes.length,
          },
        },
      });
    } catch (err) {
      // TODO SM missing snapshot
      console.error("Index Management - SnapshotManagementService - getSnapshots:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  getRepositories = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CatRepository[]>>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const res: CatRepository[] = await callWithRequest("cat.repositories", {
        format: "json",
      });
      console.log(`sm dev cat repositories response: ${JSON.stringify(res)}`);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      console.error("Index Management - SnapshotManagementService - getRepositories:", err);
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
