/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_NAME = "opensearch_index_management_dashboards";

export const DEFAULT_EMPTY_DATA = "-";

export const DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/index/";
export const POLICY_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/";
export const ACTIONS_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#actions";
export const STATES_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#states";
export const ERROR_NOTIFICATION_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#error-notifications";
export const TRANSITION_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#transitions";

export const ROUTES = Object.freeze({
  CHANGE_POLICY: "/change-policy",
  CREATE_POLICY: "/create-policy",
  EDIT_POLICY: "/edit-policy",
  MANAGED_INDICES: "/managed-indices",
  INDEX_POLICIES: "/index-policies",
  POLICY_DETAILS: "/policy-details",
  INDICES: "/indices",
  ROLLUPS: "/rollups",
  CREATE_ROLLUP: "/create-rollup",
  EDIT_ROLLUP: "/edit-rollup",
  ROLLUP_DETAILS: "/rollup-details",
  TRANSFORMS: "/transforms",
  CREATE_TRANSFORM: "/create-transform",
  EDIT_TRANSFORM: "/edit-transform",
  TRANSFORM_DETAILS: "/transform-details",
  SNAPSHOTS: "/snapshots",
});

export const BREADCRUMBS = Object.freeze({
  INDEX_MANAGEMENT: { text: "Index Management", href: "#/" },
  INDICES: { text: "Indices", href: `#${ROUTES.INDICES}` },
  INDEX_POLICIES: { text: "Index policies", href: `#${ROUTES.INDEX_POLICIES}` },
  MANAGED_INDICES: { text: "Managed indices", href: `#${ROUTES.MANAGED_INDICES}` },
  EDIT_POLICY: { text: "Edit policy" },
  CREATE_POLICY: { text: "Create policy" },
  CHANGE_POLICY: { text: "Change policy" },
  POLICY_DETAILS: { text: "Policy details" },
  ROLLUPS: { text: "Rollup jobs", href: `#${ROUTES.ROLLUPS}` },
  CREATE_ROLLUP: { text: "Create rollup job" },
  EDIT_ROLLUP: { text: "Edit rollup job" },
  ROLLUP_DETAILS: { text: "Rollup details" },
  TRANSFORMS: { text: "Transform jobs", href: `#${ROUTES.TRANSFORMS}` },
  CREATE_TRANSFORM: { text: "Create transform job" },
  EDIT_TRANSFORM: { text: "Edit transform job" },
  TRANSFORM_DETAILS: { text: "Transform details" },
});

// TODO: EUI has a SortDirection already
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export const FixedTimeunitOptions = [
  { value: "ms", text: "Millisecond(s)" },
  { value: "s", text: "Second(s)" },
  { value: "m", text: "Minute(s)" },
  { value: "h", text: "Hour(s)" },
  { value: "d", text: "Day(s)" },
];

export const CalendarTimeunitOptions = [
  { value: "m", text: "Minute" },
  { value: "h", text: "Hour" },
  { value: "d", text: "Day" },
  { value: "w", text: "Week" },
  { value: "M", text: "Month" },
  { value: "q", text: "Quarter" },
  { value: "y", text: "Year" },
];

export enum IntervalType {
  FIXED = "fixed",
  CALENDAR = "calendar",
}
