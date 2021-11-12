/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultHeaders, IndexManagementApi } from "../models/interfaces";

export const API_ROUTE_PREFIX = "/_plugins/_ism";
export const API_ROUTE_PREFIX_ROLLUP = "/_plugins/_rollup";
export const TRANSFORM_ROUTE_PREFIX = "/_plugins/_transform";
export const NOTIFICATIONS_API_ROUTE_PREFIX = "/_plugins/_notifications";

export const API: IndexManagementApi = {
  POLICY_BASE: `${API_ROUTE_PREFIX}/policies`,
  EXPLAIN_BASE: `${API_ROUTE_PREFIX}/explain`,
  RETRY_BASE: `${API_ROUTE_PREFIX}/retry`,
  ADD_POLICY_BASE: `${API_ROUTE_PREFIX}/add`,
  REMOVE_POLICY_BASE: `${API_ROUTE_PREFIX}/remove`,
  CHANGE_POLICY_BASE: `${API_ROUTE_PREFIX}/change_policy`,
  ROLLUP_JOBS_BASE: `${API_ROUTE_PREFIX_ROLLUP}/jobs`,
  TRANSFORM_BASE: `${TRANSFORM_ROUTE_PREFIX}`,
};

export const DEFAULT_HEADERS: DefaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export enum CLUSTER {
  ADMIN = "admin",
  ISM = "opendistro_ism",
  DATA = "data",
}

export enum INDEX {
  OPENDISTRO_ISM_CONFIG = ".opendistro-ism-config",
}

export enum Setting {
  RolloverAlias = "plugins.index_state_management.rollover_alias",
}

export const SECURITY_EXCEPTION_PREFIX = "[security_exception]";
