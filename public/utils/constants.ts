/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { JSONSchema4TypeName } from "@types/json-schema";
import { InitOption } from "../lib/field";
import { ComponentMapEnum } from "../components/FormGenerator";

export const PLUGIN_NAME = "opensearch_index_management_dashboards";

export const DEFAULT_EMPTY_DATA = "-";

export const DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/index/";
export const POLICY_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/";
export const ACTIONS_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#actions";
export const STATES_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#states";
export const ERROR_NOTIFICATION_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#error-notifications";
export const TRANSITION_DOCUMENTATION_URL = "https://opensearch.org/docs/im-plugin/ism/policies/#transitions";
export const INDEX_SETTINGS_URL = "https://opensearch.org/docs/latest/api-reference/index-apis/create-index#index-settings";
export const SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL = "https://opensearch.org/docs/latest/opensearch/snapshots/snapshot-management/";
export const CRON_EXPRESSION_DOCUMENTATION_URL = "https://opensearch.org/docs/latest/monitoring-plugins/alerting/cron/";
export const RESTORE_SNAPSHOT_DOCUMENTATION_URL =
  "https://opensearch.org/docs/latest/opensearch/snapshots/snapshot-restore/#restore-snapshots";
export const REPOSITORY_DOCUMENTATION_URL = "https://opensearch.org/docs/latest/opensearch/snapshots/snapshot-restore/#register-repository";
export const FS_REPOSITORY_DOCUMENTATION_URL =
  "https://opensearch.org/docs/latest/opensearch/snapshots/snapshot-restore/#shared-file-system";
export const S3_REPOSITORY_DOCUMENTATION_URL = "https://opensearch.org/docs/latest/opensearch/snapshots/snapshot-restore/#amazon-s3";
export const SHRINK_DOCUMENTATION_URL = "https://opensearch.org/docs/latest/api-reference/index-apis/shrink-index";

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
  SNAPSHOT_POLICIES: "/snapshot-policies",
  SNAPSHOT_POLICY_DETAILS: "/snapshot-policy-details",
  CREATE_SNAPSHOT_POLICY: "/create-snapshot-policy",
  EDIT_SNAPSHOT_POLICY: "/edit-snapshot-policy",
  SNAPSHOTS: "/snapshots",
  CREATE_SNAPSHOT: "/create-snapshot",
  EDIT_SNAPSHOT: "/edit-snapshot",
  REPOSITORIES: "/repositories",
  CREATE_REPOSITORY: "/create-repository",
  EDIT_REPOSITORY: "/edit-repository",
  CREATE_INDEX: "/create-index",
  INDEX_DETAIL: "/index-detail",
  REINDEX: "/reindex",
  ALIASES: "/aliases",
  TEMPLATES: "/templates",
  CREATE_TEMPLATE: "/create-template",
  SPLIT_INDEX: "/split-index",
  SHRINK_INDEX: "/shrink-index",
  ROLLOVER: "/rollover",
  DATA_STREAMS: "/data-streams",
  CREATE_DATA_STREAM: "/create-data-stream",
  FORCE_MERGE: "/force-merge",
  NOTIFICATIONS: "/notifications",
  COMPOSABLE_TEMPLATES: "/composable-templates",
  CREATE_COMPOSABLE_TEMPLATE: "/create-composable-template",
});

export const BREADCRUMBS = Object.freeze({
  INDEX_MANAGEMENT: { text: "Index Management", href: "#/" },
  INDICES: { text: "Indexes", href: `#${ROUTES.INDICES}` },
  INDEX_POLICIES: { text: "State management policies", href: `#${ROUTES.INDEX_POLICIES}` },
  INDEX_POLICIES_NEW: { text: "Index state management policies", href: `#${ROUTES.INDEX_POLICIES}` },
  MANAGED_INDICES: { text: "Policy managed indexes", href: `#${ROUTES.MANAGED_INDICES}` },
  EDIT_POLICY: { text: "Edit policy" },
  CREATE_POLICY: { text: "Create policy" },
  CREATE_POLICY_NEW: { text: "Create index state management policy" },
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

  SNAPSHOT_MANAGEMENT: { text: "Snapshot Management", href: `#${ROUTES.SNAPSHOT_POLICIES}` },

  SNAPSHOT_POLICIES: { text: "Snapshot policies", href: `#${ROUTES.SNAPSHOT_POLICIES}` },
  SNAPSHOT_POLICY_DETAILS: { text: "Snapshot policy details" },
  CREATE_SNAPSHOT_POLICY: { text: "Create snapshot policy" },
  EDIT_SNAPSHOT_POLICY: { text: "Edit snapshot policy" },

  SNAPSHOTS: { text: "Snapshots", href: `#${ROUTES.SNAPSHOTS}` },
  INDEX_SNAPSHOTS: { text: "Index snapshots", href: `#${ROUTES.SNAPSHOTS}` },
  SNAPSHOT_RESTORE: { text: "Restore activities in progress" },
  INDEX_SNAPSHOT_RESTORE: { text: "Index snapshots" },
  CREATE_SNAPSHOT: { text: "Create repository", href: `#${ROUTES.CREATE_REPOSITORY}` },
  EDIT_SNAPSHOT: { text: "Edit repository", href: `#${ROUTES.EDIT_REPOSITORY}` },

  REPOSITORIES: { text: "Repositories", href: `#${ROUTES.REPOSITORIES}` },
  SNAPSHOT_REPOSITORIES: { text: "Snapshot repositories", href: `#${ROUTES.REPOSITORIES}` },
  CREATE_REPOSITORY: { text: "Create repository", href: `#${ROUTES.CREATE_REPOSITORY}` },
  EDIT_REPOSITORY: { text: "Edit repository", href: `#${ROUTES.EDIT_REPOSITORY}` },
  CREATE_INDEX: { text: "Create Index", href: `#${ROUTES.CREATE_INDEX}` },
  EDIT_INDEX: { text: "Edit Index", href: `#${ROUTES.CREATE_INDEX}` },
  INDEX_DETAIL: { text: "Index Detail", href: "#" },
  REINDEX: { text: "Reindex", href: `#${ROUTES.REINDEX}` },
  ALIASES: { text: "Aliases", href: `#${ROUTES.ALIASES}` },
  TEMPLATES: { text: "Templates", href: `#${ROUTES.TEMPLATES}` },
  CREATE_TEMPLATE: { text: "Create template", href: `#${ROUTES.CREATE_TEMPLATE}` },
  EDIT_TEMPLATE: { text: "Edit template", href: `#${ROUTES.CREATE_TEMPLATE}` },
  SPLIT_INDEX: { text: "Split Index", href: `#${ROUTES.SPLIT_INDEX}` },
  SHRINK_INDEX: { text: "Shrink index", href: `#${ROUTES.SHRINK_INDEX}` },
  ROLLOVER: { text: "Rollover", href: `#${ROUTES.ROLLOVER}` },
  DATA_STREAMS: { text: "Data streams", href: `#${ROUTES.DATA_STREAMS}` },
  CREATE_DATA_STREAM: { text: "Create data stream", href: `#${ROUTES.CREATE_DATA_STREAM}` },
  FORCE_MERGE: { text: "Force merge", href: `#${ROUTES.FORCE_MERGE}` },
  COMPOSABLE_TEMPLATES: { text: "Component templates", href: `#${ROUTES.COMPOSABLE_TEMPLATES}` },
  CREATE_COMPOSABLE_TEMPLATE: { text: "Create component template", href: `#${ROUTES.CREATE_COMPOSABLE_TEMPLATE}` },
  NOTIFICATION_SETTINGS: { text: "Notification settings", href: `#${ROUTES.NOTIFICATIONS}` },
  INDEX_NOTIFICATION_SETTINGS: { text: "Index operations notifications", href: `#${ROUTES.NOTIFICATIONS}` },
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

export const browseIndicesCols = [
  {
    field: "index",
    name: "Index",
    width: "100%",
    truncateText: true,
    sortable: true,
  },
];

export const restoreIndicesCols = [
  {
    field: "index",
    name: "Index",
    width: "75%",
    truncateText: true,
    sortable: true,
  },
  {
    field: "restore_status",
    name: "Restore status",
    width: "25%",
    sortable: true,
  },
];
export const INDEX_IMPORT_SETTINGS = ["index.number_of_replicas", "index.number_of_shards", "index.refresh_interval"];

export const INDEX_DYNAMIC_SETTINGS = [
  "index.number_of_replicas",
  "index.auto_expand_replicas",
  "index.search.idle.after",
  "index.refresh_interval",
  "index.max_result_window",
  "index.max_inner_result_window",
  "index.max_rescore_window",
  "index.max_docvalue_fields_search",
  "index.max_script_fields",
  "index.max_ngram_diff",
  "index.max_shingle_diff",
  "index.max_refresh_listeners",
  "index.analyze.max_token_count",
  "index.highlight.max_analyzed_offset",
  "index.max_terms_count",
  "index.max_regex_length",
  "index.query.default_field",
  "index.routing.allocation.enable",
  "index.gc_deletes",
  "index.default_pipeline",
  "index.final_pipeline",
  "index.hidden",
];

export const INDEX_MAPPING_TYPES: {
  label: string;
  hasChildren?: boolean;
  options?: {
    fields?: (InitOption & { name: string; label: string; type: ComponentMapEnum; initValue?: any; validateType: JSONSchema4TypeName })[];
  };
}[] = [
  {
    label: "alias",
    options: {
      fields: [
        {
          label: "Path",
          name: "path",
          type: "Input",
          validateType: "string",
          rules: [
            {
              required: true,
              message: "Path is required.",
            },
          ],
        },
      ],
    },
  },
  {
    label: "boolean",
  },
  {
    label: "binary",
  },
  {
    label: "completion",
  },
  {
    label: "date",
  },
  {
    label: "date_range",
  },
  {
    label: "double",
  },
  {
    label: "double_range",
  },
  {
    label: "float",
  },
  {
    label: "geo_point",
  },
  {
    label: "geo_shape",
  },
  {
    label: "half_float",
  },
  {
    label: "integer",
  },
  {
    label: "ip",
  },
  {
    label: "ip_range",
  },
  {
    label: "keyword",
  },
  {
    label: "long",
  },
  {
    label: "long_range",
  },
  {
    label: "object",
    hasChildren: true,
  },
  {
    label: "percolator",
  },
  {
    label: "rank_feature",
  },
  {
    label: "rank_features",
  },
  {
    label: "search_as_you_type",
  },
  {
    label: "text",
  },
  {
    label: "token_count",
    options: {
      fields: [
        {
          label: "Analyzer",
          name: "analyzer",
          initValue: "standard",
          type: "Input",
          validateType: "string",
          rules: [
            {
              required: true,
              message: "Analyzer is required.",
            },
          ],
        },
      ],
    },
  },
];

export enum IndicesUpdateMode {
  mappings = "mappings",
  settings = "settings",
  alias = "aliases",
}

export const INDEX_MAPPING_TYPES_WITH_CHILDREN = INDEX_MAPPING_TYPES.filter((item) => item.hasChildren).map((item) => item.label);

export const DEFAULT_LEGACY_ERROR_NOTIFICATION = {
  destination: {
    slack: {
      url: "<url>",
    },
  },
  message_template: {
    source: "The index {{ctx.index}} failed during policy execution.",
  },
};

export const ALIAS_STATUS_OPTIONS = ["open", "closed", "hidden", "none", "all"].map((item) => ({
  label: item,
  value: item,
}));

export const INDEX_NAMING_MESSAGE = `Must be in lowercase letters. Cannot begin with underscores or hyphens. Spaces, commas, and characters :, \", *, +, /, \, |, ?, #, > are not allowed.`;
export const TEMPLATE_NAMING_MESSAGE = `Must be in lowercase letters. Cannot begin with underscores. Spaces, commas, and characters *, # are not allowed.`;

export const REPLICA_NUMBER_MESSAGE = "Specify the number of replicas each primary shard should have. Default is 1.";

export const TEMPLATE_TYPE = {
  INDEX_TEMPLATE: "Indexes",
  DATA_STREAM: "Data streams",
};

export const INDEX_NAMING_PATTERN = /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/;
export const TEMPLATE_NAMING_PATTERN = /^[^A-Z_*,\s#][^A-Z*,\s#]*$/;

// Based on the alias validation logic in the core repo:
// https://github.com/opensearch-project/OpenSearch/blob/main/server/src/main/java/org/opensearch/cluster/metadata/MetadataCreateIndexService.java#L267
export const ALIAS_NAMING_MESSAGE =
  "An alias must be 1-255 characters long" +
  ', cannot be ".", or ".."' +
  ", cannot start with _, -, or +" +
  ', and cannot contain spaces, commas, \\, /, *, ?, ", <, >, |, #, or :.';
export const ALIAS_NAMING_PATTERN = /^(?![_\-\+])(?!.*\.\.)[^\s,\\\/\*\?"<>|#:\.]{1,255}$/;

export const ALIAS_SELECT_RULE = [
  {
    validator: (rules: any, valueObject?: Record<string, any>) => {
      const value = Object.keys(valueObject || {});
      if (Array.isArray(value) && value.length) {
        const notMatchedAliases = value.filter((item) => !item.match(INDEX_NAMING_PATTERN));
        if (notMatchedAliases.length) {
          return Promise.reject(`
          Invalid alias name for ${notMatchedAliases.join(", ")}.\n
          Rule for alias name: ${INDEX_NAMING_MESSAGE}
        `);
        }
      }
      return Promise.resolve("");
    },
  },
];

export enum INDEX_OP_BLOCKS_TYPE {
  CLOSED = "4",
  READ_ONLY = "5",
  META_DATA = "9",
  READ_ONLY_ALLOW_DELETE = "12",
}

export enum INDEX_OP_TARGET_TYPE {
  INDEX = "indexes",
  ALIAS = "aliases",
  DATA_STREAM = "data streams",
}
