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

  catSnapshots = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSnapshotsResponse>>> => {
    try {
      const { from, size, sortField, sortDirection } = request.query as {
        from: string;
        size: string;
        sortField: string;
        sortDirection: string;
      };

      // if no repository input, we need to first get back all repositories
      const getRepositoryRes = await this.getRepositories(context, request, response);
      const repositories = getRepositoryRes.payload?.response.map((repo) => repo.id);
      console.log(`sm dev get repositories ${JSON.stringify(repositories)}`);

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      let snapshots: CatSnapshot[] = [];
      for (let i = 0; i < repositories.length; i++) {
        const params = {
          format: "json",
          s: `${sortField}:${sortDirection}`,
          repository: repositories[i],
        };
        const catSnapshotsRes: CatSnapshot[] = await callWithRequest("cat.snapshots", params);
        const snapshotsWithRepo = catSnapshotsRes.map((item) => ({ ...item, repository: repositories[i] }));
        console.log(`sm dev cat snapshot response: ${JSON.stringify(catSnapshotsRes)}`);
        snapshots = [...snapshots, ...snapshotsWithRepo];
      }

      // policies, loop through all snapshot, if the name matche policy, then it blongs to this policy, we can add the policy name to this snapshot row

      // _cat doesn't support pagination, do our own in server pagination to at least reduce network bandwidth
      const fromNumber = parseInt(from, 10);
      const sizeNumber = parseInt(size, 10);
      const paginatedSnapshots = snapshots.slice(fromNumber, fromNumber + sizeNumber);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            snapshots: paginatedSnapshots,
            totalSnapshots: snapshots.length,
          },
        },
      });
    } catch (err) {
      // TODO SM handle missing snapshot exception, return empty
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

  getSnapshots = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any>>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const res: any = await callWithRequest("snapshot.get", {
        repository: "repo",
        snapshot: "_all",
        ignore_unavailable: true,
      });
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
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
}
