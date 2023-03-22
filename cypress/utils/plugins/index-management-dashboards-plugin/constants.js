/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const IM_API_ROUTE_PREFIX = "/_plugins/_ism";
export const IM_API_ROUTE_PREFIX_ROLLUP = "/_plugins/_rollup";
export const IM_API_ROUTE_PREFIX_TRANSFORM = "/_plugins/_transform";
export const IM_CONFIG_INDEX = {
  OPENDISTRO_ISM_CONFIG: ".opendistro-ism-config",
};
export const IM_API = {
  INDEX_TEMPLATE_BASE: "/_index_template",
  INDEX_TEMPLATE_COMPONENT_BASE: "/_component_template",
  DATA_STREAM_BASE: "/_data_stream",
  POLICY_BASE: `${IM_API_ROUTE_PREFIX}/policies`,
  EXPLAIN_BASE: `${IM_API_ROUTE_PREFIX}/explain`,
  RETRY_BASE: `${IM_API_ROUTE_PREFIX}/retry`,
  ADD_POLICY_BASE: `${IM_API_ROUTE_PREFIX}/add`,
  REMOVE_POLICY_BASE: `${IM_API_ROUTE_PREFIX}/remove`,
  CHANGE_POLICY_BASE: `${IM_API_ROUTE_PREFIX}/change_policy`,
  ROLLUP_JOBS_BASE: `${IM_API_ROUTE_PREFIX_ROLLUP}/jobs`,
  TRANSFORM_JOBS_BASE: `${IM_API_ROUTE_PREFIX_TRANSFORM}`,
};
export const IM_PLUGIN_NAME = "opensearch_index_management_dashboards";
