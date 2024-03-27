/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const BASE_API_PATH = "/api/ism";
export const NODE_API = Object.freeze({
  _SEARCH: `${BASE_API_PATH}/_search`,
  _SEARCH_SAMPLE_DATA: `${BASE_API_PATH}/_searchSampleData`,
  _INDICES: `${BASE_API_PATH}/_indices`,
  _DATA_STREAMS: `${BASE_API_PATH}/_data_streams`,
  _ALIASES: `${BASE_API_PATH}/_aliases`,
  _MAPPINGS: `${BASE_API_PATH}/_mappings`,
  APPLY_POLICY: `${BASE_API_PATH}/applyPolicy`,
  EDIT_ROLLOVER_ALIAS: `${BASE_API_PATH}/editRolloverAlias`,
  POLICIES: `${BASE_API_PATH}/policies`,
  _RECOVERY: `${BASE_API_PATH}/_recovery`,
  ROLLUPS: `${BASE_API_PATH}/rollups`,
  TRANSFORMS: `${BASE_API_PATH}/transforms`,
  MANAGED_INDICES: `${BASE_API_PATH}/managedIndices`,
  CHANNELS: `${BASE_API_PATH}/_notifications/channels`,
  RETRY: `${BASE_API_PATH}/retry`,
  CHANGE_POLICY: `${BASE_API_PATH}/changePolicy`,
  REMOVE_POLICY: `${BASE_API_PATH}/removePolicy`,
  SMPolicies: `${BASE_API_PATH}/smPolicies`,
  _SNAPSHOTS: `${BASE_API_PATH}/_snapshots`,
  _REPOSITORIES: `${BASE_API_PATH}/_repositores`,
  PUT_INDEX: `${BASE_API_PATH}/putIndex`,
  API_CALLER: `${BASE_API_PATH}/apiCaller`,
  ACCOUNT_INFO: `${BASE_API_PATH}/accountInfo`,
});

export const REQUEST = Object.freeze({
  PUT: "PUT",
  DELETE: "DELETE",
  GET: "GET",
  POST: "POST",
  HEAD: "HEAD",
});

export const SYSTEM_INDEX = [
  ".plugins-ml-model",
  ".plugins-ml-task",
  ".opendistro-alerting-config",
  ".opendistro-alerting-alert*",
  ".opendistro-anomaly-results*",
  ".opendistro-anomaly-detector*",
  ".opendistro-anomaly-checkpoints",
  ".opendistro-anomaly-detection-state",
  ".opendistro-reports-*",
  ".opensearch-notifications-*",
  ".opensearch-notebooks",
  ".opensearch-observability",
  ".opendistro-asynchronous-search-response*",
  ".opendistro_security",
  ".opendistro-job-scheduler-lock",
  ".opendistro-ism-config",
  ".replication-metadata-store",
  "kibana*",
  ".kibana*",
  ".tasks",
];

export const SYSTEM_ALIAS = [".plugins*", ".opendistro*", ".opensearch*", ".replication-metadata-store", "kibana*", ".kibana*", ".tasks"];
