/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import {
  ILegacyCustomClusterClient,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
} from "opensearch-dashboards/server";
import { DeletePolicyParams, DeletePolicyResponse, GetPoliciesResponse, PutPolicyParams, PutPolicyResponse } from "../models/interfaces";
import { PoliciesSort, ServerResponse } from "../models/types";
import { DocumentPolicy, Policy } from "../../models/interfaces";

export default class PolicyService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend Put Policy API
   */
  putPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<PutPolicyResponse> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const { seqNo, primaryTerm } = request.query as { seqNo?: string; primaryTerm?: string };
      let method = "ism.putPolicy";
      let params: PutPolicyParams = { policyId: id, ifSeqNo: seqNo, ifPrimaryTerm: primaryTerm, body: JSON.stringify(request.body) };
      if (seqNo === undefined || primaryTerm === undefined) {
        method = "ism.createPolicy";
        params = { policyId: id, body: JSON.stringify(request.body) };
      }
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const putPolicyResponse: PutPolicyResponse = await callWithRequest(method, params);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: putPolicyResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - PolicyService - putPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Delete Policy API
   */
  deletePolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<boolean> | ResponseError>> => {
    try {
      const { id } = request.params as { id: string };
      const params: DeletePolicyParams = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deletePolicyResponse: DeletePolicyResponse = await callWithRequest("ism.deletePolicy", params);
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
      console.error("Index Management - PolicyService - deletePolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicy = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DocumentPolicy>>> => {
    try {
      const { id } = request.params as { id: string };
      const params = { policyId: id };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no");
      const primaryTerm = _.get(getResponse, "_primary_term");
      if (policy) {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { id, seqNo: seqNo as number, primaryTerm: primaryTerm as number, policy: policy as Policy },
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
      console.error("Index Management - PolicyService - getPolicy:", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicies = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetPoliciesResponse>>> => {
    try {
      const { from = 0, size = 20, search, sortDirection = "desc", sortField = "id" } = request.query as {
        from: number;
        size: number;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      const policySorts: PoliciesSort = {
        id: "policy.policy_id.keyword",
        "policy.policy.description": "policy.description.keyword",
        "policy.policy.last_updated_time": "policy.last_updated_time",
      };

      const params = {
        from,
        size,
        sortOrder: sortDirection,
        sortField: policySorts[sortField] || policySorts.id,
        queryString: search.trim() ? `*${search.trim().split(" ").join("* *")}*` : "*",
      };

      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getResponse = await callWithRequest("ism.getPolicies", params);

      const policies: DocumentPolicy[] = getResponse.policies.map((p) => ({
        seqNo: p._seq_no,
        primaryTerm: p._primary_term,
        id: p._id,
        policy: p.policy,
      }));

      const totalPolicies: number = getResponse.total_policies;

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: { policies, totalPolicies },
        },
      });
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return response.custom({
          statusCode: 200,
          body: {
            ok: true,
            response: { policies: [], totalPolicies: 0 },
          },
        });
      }
      console.error("Index Management - PolicyService - getPolicies", err);
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
