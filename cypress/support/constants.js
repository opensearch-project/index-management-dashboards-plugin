/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_ROUTE_PREFIX = "/_plugins/_ism";
export const API_ROUTE_PREFIX_ROLLUP = "/_plugins/_rollup";
export const API_ROUTE_PREFIX_TRANSFORM = "/_plugins/_transform";

export const INDEX = {
  OPENDISTRO_ISM_CONFIG: ".opendistro-ism-config",
};

export const API = {
  INDEX_TEMPLATE_BASE: "/_index_template",
  DATA_STREAM_BASE: "/_data_stream",
  POLICY_BASE: `${API_ROUTE_PREFIX}/policies`,
  EXPLAIN_BASE: `${API_ROUTE_PREFIX}/explain`,
  RETRY_BASE: `${API_ROUTE_PREFIX}/retry`,
  ADD_POLICY_BASE: `${API_ROUTE_PREFIX}/add`,
  REMOVE_POLICY_BASE: `${API_ROUTE_PREFIX}/remove`,
  CHANGE_POLICY_BASE: `${API_ROUTE_PREFIX}/change_policy`,
  ROLLUP_JOBS_BASE: `${API_ROUTE_PREFIX_ROLLUP}/jobs`,
  TRANSFORM_JOBS_BASE: `${API_ROUTE_PREFIX_TRANSFORM}`,
};

export const PLUGIN_NAME = "opensearch_index_management_dashboards";
