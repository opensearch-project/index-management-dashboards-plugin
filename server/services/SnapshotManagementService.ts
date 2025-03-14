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
} from "../../../../src/core/server";
import { SMPolicy, DocumentSMPolicy, DocumentSMPolicyWithMetadata } from "../../models/interfaces";
import {
  CatRepository,
  CatSnapshotIndex,
  CatSnapshotWithRepoAndPolicy,
  GetIndexRecoveryResponse,
  GetSnapshotsResponse,
  GetSMPoliciesResponse,
  DeletePolicyResponse,
  GetSnapshot,
  GetSnapshotResponse,
  GetRepositoryResponse,
  AcknowledgedResponse,
  CreateSnapshotResponse,
  RestoreSnapshotResponse,
  CatSnapshots,
} from "../models/interfaces";
import { FailedServerResponse, ServerResponse } from "../models/types";
import { MDSEnabledClientService } from "./MDSEnabledClientService";

export default class SnapshotManagementService extends MDSEnabledClientService {
  getAllSnapshotsWithPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSnapshotsResponse>>> => {
    try {
      // if no repository input, we need to first get back all repositories
      const getRepositoryRes = await this.catRepositories(context, request, response);
      let repositories: string[];
      if (getRepositoryRes.payload?.ok) {
        repositories = getRepositoryRes.payload?.response.map((repo) => repo.id);
      } else {
        return response.custom({
          statusCode: 200,
          body: {
            ok: false,
            error: getRepositoryRes.payload?.error as string,
          },
        });
      }

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      let snapshots: CatSnapshotWithRepoAndPolicy[] = [];
      for (let i = 0; i < repositories.length; i++) {
        const res: GetSnapshotResponse = await callWithRequest("snapshot.get", {
          repository: repositories[i],
          snapshot: "_all",
          ignore_unavailable: true,
        });
        const snapshotWithPolicy: CatSnapshotWithRepoAndPolicy[] = res.snapshots.map((s: GetSnapshot) => ({
          id: s.snapshot,
          status: s.state,
          start_epoch: s.start_time_in_millis,
          end_epoch: s.end_time_in_millis,
          duration: s.duration_in_millis,
          indices: s.indices.length,
          successful_shards: s.shards.successful,
          failed_shards: s.shards.failed,
          total_shards: s.shards.total,
          repository: repositories[i],
          policy: s.metadata?.sm_policy,
        }));
        snapshots = [...snapshots, ...snapshotWithPolicy];
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
      // If getting a non-existing snapshot, need to handle the missing snapshot exception, and return empty
      return this.errorResponse(response, err, "getAllSnapshotsWithPolicy");
    }
  };

  getSnapshot = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSnapshot>>> => {
    try {
      const { id } = request.params as {
        id: string;
      };
      const { repository } = request.query as {
        repository: string;
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: GetSnapshotResponse = (await callWithRequest("snapshot.get", {
        repository: repository,
        snapshot: `${id}`,
        ignore_unavailable: true,
      })) as GetSnapshotResponse;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res.snapshots[0],
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "getSnapshot");
    }
  };

  deleteSnapshot = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    try {
      const { id } = request.params as {
        id: string;
      };
      const { repository } = request.query as {
        repository: string;
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const resp: AcknowledgedResponse = (await callWithRequest("snapshot.delete", {
        repository: repository,
        snapshot: `${id}`,
      })) as AcknowledgedResponse;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: resp,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "deleteSnapshot");
    }
  };

  createSnapshot = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CreateSnapshotResponse>>> => {
    try {
      const { id } = request.params as {
        id: string;
      };
      const { repository } = request.query as {
        repository: string;
      };
      const params = {
        repository: repository,
        snapshot: id,
        body: JSON.stringify(request.body),
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const resp: CreateSnapshotResponse = (await callWithRequest("snapshot.create", params)) as CreateSnapshotResponse;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: resp,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "createSnapshot");
    }
  };

  restoreSnapshot = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<RestoreSnapshotResponse>>> => {
    try {
      const { id } = request.params as {
        id: string;
      };
      const { repository } = request.query as {
        repository: string;
      };
      const params = {
        repository: repository,
        snapshot: id,
        body: JSON.stringify(request.body),
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const resp: RestoreSnapshotResponse = (await callWithRequest("snapshot.restore", params)) as RestoreSnapshotResponse;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: resp,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "restoreSnapshot");
    }
  };

  createPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DocumentSMPolicy>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = {
        policyId: id,
        body: JSON.stringify(request.body),
      };

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const rawRes = await callWithRequest("ism.createSMPolicy", params);
      const res: DocumentSMPolicy = {
        seqNo: rawRes._seq_no,
        primaryTerm: rawRes._primary_term,
        id: rawRes._id,
        policy: rawRes.sm_policy,
      };

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

  updatePolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DocumentSMPolicy>>> => {
    try {
      const { id } = request.params as { id: string };
      const { seqNo, primaryTerm } = request.query as { seqNo?: string; primaryTerm?: string };
      const params = {
        policyId: id,
        ifSeqNo: seqNo,
        ifPrimaryTerm: primaryTerm,
        body: JSON.stringify(request.body),
      };

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const rawRes = await callWithRequest("ism.updateSMPolicy", params);
      const res: DocumentSMPolicy = {
        seqNo: rawRes._seq_no,
        primaryTerm: rawRes._primary_term,
        id: rawRes._id,
        policy: rawRes.sm_policy,
      };

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "updatePolicy");
    }
  };

  getPolicies = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetSMPoliciesResponse>>> => {
    try {
      const { from, size, sortField, sortOrder, queryString } = request.query as {
        from: string;
        size: string;
        sortField: string;
        sortOrder: string;
        queryString: string;
      };

      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      let params = {
        from,
        size,
        sortField: `sm_policy.${sortField}`,
        sortOrder,
        queryString: queryString.trim() ? `${queryString.trim()}` : "*",
      };
      const res = await callWithRequest("ism.getSMPolicies", params);
      const policies: DocumentSMPolicy[] = res.policies.map(
        (p: { _id: string; _seq_no: number; _primary_term: number; sm_policy: SMPolicy }) => ({
          seqNo: p._seq_no,
          primaryTerm: p._primary_term,
          id: p._id,
          policy: p.sm_policy,
        })
      );
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { policies, totalPolicies: res.total_policies as number },
        },
      });
    } catch (err: any) {
      if (err.statusCode === 404 && err.body.error.reason === "Snapshot management config index not found") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { policies: [], totalPolicies: 0 },
          },
        });
      }
      return this.errorResponse(response, err, "getPolicies");
    }
  };

  getPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DocumentSMPolicyWithMetadata | null>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { id: id };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const getResponse = await callWithRequest("ism.getSMPolicy", params);
      const metadata = await callWithRequest("ism.explainSnapshotPolicy", params);
      const documentPolicy = {
        id: id,
        seqNo: getResponse._seq_no,
        primaryTerm: getResponse._primary_term,
        policy: getResponse.sm_policy,
        metadata: metadata.policies[0],
      };
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: documentPolicy,
        },
      });
    } catch (err: any) {
      if (err.statusCode === 404 && err.body.error.reason === "Snapshot management config index not found") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: null,
          },
        });
      }
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
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const deletePolicyResponse: DeletePolicyResponse = (await callWithRequest("ism.deleteSMPolicy", params)) as DeletePolicyResponse;
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

  startPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { id: id };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const resp: AcknowledgedResponse = (await callWithRequest("ism.startSnapshotPolicy", params)) as AcknowledgedResponse;
      if (resp.acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to start snapshot policy." },
        });
      }
    } catch (err) {
      return this.errorResponse(response, err, "startPolicy");
    }
  };

  stopPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<boolean>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { id: id };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const resp: AcknowledgedResponse = (await callWithRequest("ism.stopSnapshotPolicy", params)) as AcknowledgedResponse;
      if (resp.acknowledged) {
        return response.custom({
          statusCode: 200,
          body: { ok: true, response: true },
        });
      } else {
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: "Failed to stop snapshot policy." },
        });
      }
    } catch (err) {
      return this.errorResponse(response, err, "stopPolicy");
    }
  };

  catRepositories = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CatRepository[]>>> => {
    try {
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: CatRepository[] = (await callWithRequest("cat.repositories", {
        format: "json",
      })) as CatRepository[];
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "catRepositories");
    }
  };

  getIndexRecovery = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetIndexRecoveryResponse>>> => {
    try {
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: GetIndexRecoveryResponse = (await callWithRequest("indices.recovery", {
        format: "json",
      })) as GetIndexRecoveryResponse;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "getIndexRecovery");
    }
  };

  catSnapshotIndices = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CatSnapshotIndex[]>>> => {
    try {
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: CatSnapshotIndex[] = (await callWithRequest("cat.indices", {
        format: "json",
      })) as CatSnapshotIndex[];

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "catSnapshotIndices");
    }
  };

  catRepositoriesWithSnapshotCount = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CatRepository[]>>> => {
    try {
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: CatRepository[] = (await callWithRequest("cat.repositories", {
        format: "json",
      })) as CatRepository[];

      for (let i = 0; i < res.length; i++) {
        let catSnapshotResponse = await this._safecatSnapshotForRepo(callWithRequest, res[i].id);
        res[i].snapshotCount = catSnapshotResponse?.length;
      }

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "catRepositoriesWithSnapshotCount");
    }
  };

  private async _safecatSnapshotForRepo(
    callWithRequest: (endpoint: string, clientParams: Record<string, any>, options?: LegacyCallAPIOptions | undefined) => Promise<unknown>,
    repositoryName: string
  ): Promise<CatSnapshots[] | undefined> {
    try {
      const catSnapshotRes: CatSnapshots[] = (await callWithRequest("cat.snapshots", {
        format: "json",
        repository: repositoryName,
        ignore_unavailable: true,
      })) as CatSnapshots[];

      return catSnapshotRes;
    } catch (err) {
      console.error(`Index Management - SnapshotManagementService - _safeCatSnapshot:`, err);
      return undefined;
    }
  }

  deleteRepository = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    try {
      const { id } = request.params as { id: string };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: AcknowledgedResponse = (await callWithRequest("snapshot.deleteRepository", {
        repository: id,
      })) as AcknowledgedResponse;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "deleteRepository");
    }
  };

  getRepository = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetRepositoryResponse>>> => {
    try {
      const { id } = request.params as { id: string };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: GetRepositoryResponse = (await callWithRequest("snapshot.getRepository", {
        repository: id,
      })) as GetRepositoryResponse;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "getRepository");
    }
  };

  createRepository = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = {
        repository: id,
        body: JSON.stringify(request.body),
      };
      const callWithRequest = this.getClientBasedOnDataSource(context, request);
      const res: AcknowledgedResponse = (await callWithRequest("snapshot.createRepository", params)) as AcknowledgedResponse;
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: res,
        },
      });
    } catch (err) {
      return this.errorResponse(response, err, "createRepository");
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
