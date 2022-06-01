/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import {
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  ResponseError,
} from "../../../../src/core/server";
import { SMPolicy, DocumentSMPolicy } from "../../models/interfaces";
import { CatRepository, CatSnapshot, GetSnapshotsResponse, GetSMPoliciesResponse, DeletePolicyResponse } from "../models/interfaces";
import { FailedServerResponse, ServerResponse } from "../models/types";

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
      let repositories: string[];
      if (getRepositoryRes.payload?.ok) {
        repositories = getRepositoryRes.payload?.response.map((repo) => repo.id);
        console.log(`sm dev get repositories ${JSON.stringify(repositories)}`);
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: getRepositoryRes.payload?.error as string,
          },
        });
      }

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      let snapshots: CatSnapshot[] = [];
      for (let i = 0; i < repositories.length; i++) {
        const params = {
          format: "json",
          s: `${sortField}:${sortDirection}`,
          repository: repositories[i],
          // time: "ms",
        };
        // try catch the missing snapshot exception
        const catSnapshotsRes: CatSnapshot[] = await callWithRequest("cat.snapshots", params);
        const snapshotsWithRepo = catSnapshotsRes.map((item) => ({ ...item, repository: repositories[i] }));
        console.log(`sm dev cat snapshot response: ${JSON.stringify(catSnapshotsRes)}`);
        snapshots = [...snapshots, ...snapshotsWithRepo];
      }

      // populate policy field for snapshot
      const getSMPoliciesRes = await this.getPolicies(context, request, response);
      if (getSMPoliciesRes.payload?.ok) {
        const policyNames = getSMPoliciesRes.payload?.response.policies
          .map((policy) => policy.policy.name)
          .sort((a, b) => b.length - a.length);
        function addPolicyField(snapshot: CatSnapshot) {
          for (let i = 0; i < policyNames.length; i++) {
            if (snapshot.id.startsWith(policyNames[i])) {
              return { ...snapshot, policy: policyNames[i] };
            } else {
              return snapshot;
            }
          }
          return snapshot;
        }
        snapshots = snapshots.map(addPolicyField);
      }

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            snapshots: snapshots,
            totalSnapshots: snapshots.length,
          },
        },
      });
    } catch (err) {
      // TODO SM handle missing snapshot exception, return empty
      return this.errorResponse(response, err, "catSnapshots");
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
      return this.errorResponse(response, err, "getRepositories");
    }
  };

  getSnapshot = async (
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
      console.log(`sm dev response: ${JSON.stringify(res)}`);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "getSnapshot");
    }
  };

  createPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = {
        policyId: id,
        body: JSON.stringify(request.body),
      };

      console.log(`sm dev create policy ${JSON.stringify(request.body)}`);

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const res: any = await callWithRequest("ism.createSMPolicy", params);
      console.log(`sm dev server response: ${JSON.stringify(res)}`);

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "createPolicy");
    }
  };

  getPolicies = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSMPoliciesResponse>>> => {
    try {
      const { from, size, sortField, sortDirection } = request.query as {
        from: string;
        size: string;
        sortField: string;
        sortDirection: string;
      };

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      let params = {};
      const res = await callWithRequest("ism.getSMPolicies", params);
      // console.log(`sm dev server get policies response: ${JSON.stringify(res)}`);

      const policies: DocumentSMPolicy[] = res.policies.map((p: { _id: string; _seq_no: number; _primary_term: number; sm: SMPolicy }) => ({
        seqNo: p._seq_no,
        primaryTerm: p._primary_term,
        id: p._id,
        policy: p.sm,
      }));
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { policies, totalPolicies: res.total_policies as number },
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "getPolicies");
    }
  };

  getPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DocumentSMPolicy>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getSMPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (policy) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, policy: policy as SMPolicy },
          },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: "Failed to load policy",
          },
        });
      }
    } catch (err) {
      return this.errorResponse(response, err, "getPolicy");
    }
  };

  deletePolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deletePolicyResponse: DeletePolicyResponse = await callWithRequest("ism.deleteSMPolicy", params);
      if (deletePolicyResponse.result !== "deleted") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: deletePolicyResponse.result,
          },
        });
      }
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: true,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "deletePolicy");
    }
  };

  errorResponse = (
    response: OpenSearchDashboardsResponseFactory,
    error: any,
    methodName: string
  ): IOpenSearchDashboardsResponse<FailedServerResponse> => {
    console.error(`Index Management - SnapshotManagementService - ${methodName}:`, error);

    return response.custom({
      statusCode: 200, // error?.statusCode || 500,
      body: {
        ok: false,
        error: this.parseEsErrorResponse(error),
      },
    });
  };

  parseEsErrorResponse = (error: any): string => {
    if (error.response) {
      try {
        const esErrorResponse = JSON.parse(error.response);
        return esErrorResponse.reason || error.response;
      } catch (parsingError) {
        return error.response;
      }
    }
    return error.message;
  };
}
