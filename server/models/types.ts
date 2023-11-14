/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
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
