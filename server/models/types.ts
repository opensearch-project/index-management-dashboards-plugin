/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MatchAllQuery {
  match_all: {};
}

export interface ManagedIndicesSort {
  [sortField: string]: string;
  index: "managed_index.index";
  policyId: "managed_index.policy_id";
}

export interface PoliciesSort {
  [sortField: string]: string;
  id: "policy.policy_id.keyword";
  "policy.policy.description": "policy.description.keyword";
  "policy.policy.last_updated_time": "policy.last_updated_time";
}

export interface RollupsSort {
  [sortField: string]: string;
  id: "rollup.rollup_id.keyword";
  "rollup.rollup.description": "rollup.description.keyword";
  "rollup.rollup.last_updated_time": "rollup.last_updated_time";
}

export type ServerResponse<T> = FailedServerResponse | { ok: true; response: T; error?: string; body?: any };
export interface FailedServerResponse {
  ok: false;
  error: string;
  body?: any;
}
