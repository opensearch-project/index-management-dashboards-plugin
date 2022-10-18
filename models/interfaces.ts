/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Backend has PR out to change this model, this needs to be updated once that goes through

import { long } from "@opensearch-project/opensearch/api/types";
import { ActionType } from "../public/pages/VisualCreatePolicy/utils/constants";

export interface ManagedIndexMetaData {
  index: string;
  indexUuid: string;
  policyId: string;
  policySeqNo?: number;
  policyPrimaryTerm?: number;
  policyCompleted?: boolean;
  rolledOver?: boolean;
  transitionTo?: string;
  state?: { name: string; startTime: number };
  action?: { name: string; startTime: number; index: number; failed: boolean; consumedRetries: number };
  retryInfo?: { failed: boolean; consumedRetries: number };
  info?: object;
}

export type MappingsPropertiesObject = Record<
  string,
  {
    type: string;
    properties?: MappingsPropertiesObject;
  }
>;

export type MappingsProperties = {
  fieldName: string;
  type: string;
  properties?: MappingsProperties;
}[];

export interface IndexItem {
  index: string;
  indexUuid?: string;
  settings?: {
    index: {
      number_of_shards: number;
      number_of_replicas: number;
    };
  };
  aliases?: Record<string, {}>;
  mappings?: {
    properties?: MappingsProperties;
  };
}

/**
 * ManagedIndex item shown in the Managed Indices table
 */
export interface ManagedIndexItem extends IndexItem {
  indexUuid: string;
  dataStream: string | null;
  policyId: string;
  policySeqNo: number;
  policyPrimaryTerm: number;
  policy: Policy | null;
  enabled: boolean;
  managedIndexMetaData: ManagedIndexMetaData | null;
}

/**
 * Interface what the Policy Opensearch Document
 */
export interface DocumentPolicy {
  id: string;
  primaryTerm: number;
  seqNo: number;
  policy: Policy;
}

// Data model that contains both rollup item and metadata of rollup job
export interface DocumentRollup {
  _id: string;
  _seqNo: number;
  _primaryTerm: number;
  rollup: Rollup;
  metadata: any;
}

export interface DocumentTransform {
  _id: string;
  _seqNo: number;
  _primaryTerm: number;
  transform: Transform;
  metadata: any;
}

export interface Policy {
  description: string;
  default_state: string;
  error_notification?: ErrorNotification | null;
  states: State[];
  ism_template?: ISMTemplate[] | ISMTemplate | null;
  last_updated_time?: number;
  schema_version?: number;
}

export interface DocumentSMPolicy {
  id: string;
  seqNo: number;
  primaryTerm: number;
  policy: SMPolicy;
}

export interface DocumentSMPolicyWithMetadata {
  id: string;
  seqNo: number;
  primaryTerm: number;
  policy: SMPolicy;
  metadata: SMMetadata;
}

export interface SMMetadata {
  name: string;
  creation?: SMWorkflowMetadata;
  deletion?: SMWorkflowMetadata;
  policy_seq_no?: number;
  policy_primary_term?: number;
  enabled: boolean;
}

export interface SMWorkflowMetadata {
  trigger: {
    time: number;
  };
  started: string[];
  latest_execution: {
    status: string;
    start_time: long;
    end_time?: long;
    info?: {
      message?: string;
      cause?: string;
    };
  };
}

export interface SMPolicy {
  name: string;
  description: string;
  creation: SMCreation;
  deletion?: SMDeletion;
  snapshot_config: SMSnapshotConfig;
  enabled: boolean;
  last_updated_time?: number;
  notification?: Notification;
}

export interface Snapshot {
  indices: string;
  ignore_unavailable: boolean;
  include_global_state: boolean;
  partial: boolean;
  metadata?: object;
}

export interface SMSnapshotConfig {
  repository: string;
  indices?: string;
  ignore_unavailable?: boolean;
  include_global_state?: boolean;
  partial?: boolean;
  date_format?: string;
  date_format_timezone?: string;
}

export interface SMCreation {
  schedule: Cron;
  time_limit?: string;
}

export interface SMDeletion {
  schedule?: Cron;
  condition?: SMDeleteCondition;
  time_limit?: string;
}

export interface SMDeleteCondition {
  max_count?: number;
  max_age?: string;
  min_count?: number;
}

export interface ErrorNotification {
  destination?: Destination;
  channel?: Channel;
  message_template: MessageTemplate;
}

export interface Notification {
  channel: Channel;
  conditions?: SMNotificationCondition;
}

export interface Channel {
  id: string;
}

export interface SMNotificationCondition {
  creation?: boolean;
  deletion?: boolean;
  failure?: boolean;
  time_limit_exceeded?: boolean;
}

export interface Destination {
  chime?: {
    url: string;
  };
  slack?: {
    url: string;
  };
  custom_webhook?: {
    url: string;
    [other: string]: any; // custom webhook also allows users to create by part including customizing headers/query params, port/host, etc.
  };
}

export interface MessageTemplate {
  source: string;
  lang?: string;
}

export interface ISMTemplate {
  index_patterns: string[];
  priority: number;
}

export interface State {
  name: string;
  actions?: Action[];
  transitions?: Transition[];
}

export interface Action {
  timeout?: string;
  retry?: Retry;
  [action: string]: any;
}

export interface Retry {
  count?: number;
  backoff?: string;
  delay?: string;
}

export interface UIAction<Data> {
  action: Data;
  id: string;
  type: ActionType | string;
  render: (uiAction: UIAction<Data>, onChangeAction: (uiAction: UIAction<Data>) => void) => JSX.Element | null;
  isValid: () => boolean;
  clone: (action: Data) => UIAction<Data>;
  content: () => JSX.Element | string | null;
  toAction: () => Action;
}

export interface ForceMergeAction extends Action {
  force_merge: {
    max_num_segments?: number;
  };
}

export interface ReadOnlyAction extends Action {
  read_only: {};
}

export interface ReadWriteAction extends Action {
  read_write: {};
}

export interface ReplicaCountAction extends Action {
  replica_count: {
    number_of_replicas?: number;
  };
}

export interface CloseAction extends Action {
  close: {};
}

export interface OpenAction extends Action {
  open: {};
}

export interface DeleteAction extends Action {
  delete: {};
}

export interface RolloverAction extends Action {
  rollover: {
    min_size?: string;
    min_doc_count?: number;
    min_index_age?: string;
    min_primary_shard_size?: string;
  };
}

export interface ShrinkAction extends Action {
  shrink: {
    num_new_shards?: number;
    max_shard_size?: string;
    percentage_of_source_shards?: number;
    target_index_name_template?: MessageTemplate;
    aliases?: object[];
    force_unsafe?: boolean;
  };
  aliases_json?: string;
  force_unsafe_input?: string;
  target_index_name_template_json?: string;
}

export interface UITransition {
  transition: Transition;
  id: string;
}

export interface Transition {
  state_name: string;
  conditions?: Condition;
}

export interface Condition {
  min_index_age?: string;
  min_doc_count?: number | undefined;
  min_size?: string;
  min_rollover_age?: string;
  cron?: Cron;
}

export interface Cron {
  cron: InnerCron;
}

export interface InnerCron {
  expression: string;
  timezone: string;
}

export interface NotificationAction extends Action {
  notification: {
    destination?: Destination;
    channel?: {
      id: string;
    };
    message_template: MessageTemplate;
  };
  notificationJsonString?: string;
}

export interface SnapshotAction extends Action {
  snapshot: {
    repository: string;
    snapshot: string;
  };
}

export interface IndexPriorityAction extends Action {
  index_priority: {
    priority?: number;
  };
}

export interface AllocationAction extends Action {
  allocation: {
    // TODO: These require a complete UI and we are only supporting JSON editor for allocation for now
    // require: {
    //   [key: string]: string;
    // };
    // include: {
    //   [key: string]: string;
    // };
    // exclude: {
    //   [key: string]: string;
    // };
    // wait_for: boolean;
    jsonString: string;
  };
}

export interface RollupAction extends Action {
  rollup: {
    jsonString: string;
  };
}

export interface Rollup {
  continuous: boolean;
  delay: number | null;
  description: string;
  dimensions: RollupDimensionItem[];
  enabled: boolean;
  enabledTime: number | null;
  last_updated_time: number;
  metadata_id: string | null;
  metrics: MetricItem[];
  page_size: number;
  schedule: IntervalSchedule | CronSchedule;
  schema_version: number;
  source_index: string;
  target_index: string;
  roles: string[];
}

export interface RollupMetadata {
  metadata_id: string;
  rollup_metadata: {
    id: string;
    seq_no: number;
    primary_term: number;
    rollup_id: string;
    after_key: Map<string, any> | null;
    last_updated_time: number;
    continuous: {
      next_window_start_time: number | null;
      next_window_end_time: number | null;
    } | null;
    status: string;
    failure_reason: string | null;
    stats: {
      pages_processed: number | null;
      documents_processed: number | null;
      rollups_indexed: number | null;
      index_time_in_millis: number | null;
      search_time_in_millis: number | null;
    };
  };
}

export interface Transform {
  description: string;
  groups: RollupDimensionItem[];
  enabled: boolean;
  enabled_at: number | null;
  updated_at: number;
  metadata_id: string | null;
  aggregations: Map<String, any>;
  page_size: number;
  schedule: IntervalSchedule | CronSchedule;
  schema_version: number;
  source_index: string;
  target_index: string;
  roles: String[];
  data_selection_query: Map<String, any>;
}

export interface TransformMetadata {
  metadata_id: string;
  transform_metadata: {
    id: string;
    seq_no: number;
    primary_term: number;
    transform_id: string;
    after_key: Map<string, any> | null;
    last_updated_at: number;
    status: string;
    failure_reason: string | null;
    stats: {
      pages_processed: number | null;
      documents_processed: number | null;
      documents_indexed: number | null;
      index_time_in_millis: number | null;
      search_time_in_millis: number | null;
    };
  };
}

export interface IntervalSchedule {
  interval: {
    startTime: number | null;
    period: number;
    unit: string;
  };
}

export interface CronSchedule {
  cron: {
    expression: string;
    timezone: string;
  };
}

//Frontend dimension data model
export interface DimensionItem {
  sequence: number;
  field: FieldItem;
  aggregationMethod: string;
  interval?: number;
}

//Frontend metric data model
export interface MetricItem {
  source_field: FieldItem;
  all: boolean;
  min: boolean;
  max: boolean;
  sum: boolean;
  avg: boolean;
  value_count: boolean;
}

export interface FieldItem {
  label: string;
  type: string | undefined;
  path: string | undefined;
}

interface DateHistogramItem {
  date_histogram: {
    sourceField: string;
    fixed_interval: string | null;
    calendar_interval: string | null;
    timezone: string;
  };
}

interface TermsItem {
  terms: {
    source_field: string;
    target_field: string;
  };
}

interface HistogramItem {
  histogram: {
    source_field: string;
    target_field: string;
    interval: number;
  };
}

//Backend dimension data model
export type RollupDimensionItem = DateHistogramItem | TermsItem | HistogramItem;

//Backend metric data model
export interface RollupMetricItem {
  source_field: string;
  metrics: [
    {
      min?: Object;
      max?: Object;
      sum?: Object;
      avg?: Object;
      value_count?: Object;
    }
  ];
}

export type TransformGroupItem = DateHistogramItem | TermsItem | HistogramItem;

export enum GROUP_TYPES {
  histogram = "histogram",
  dateHistogram = "date_histogram",
  terms = "terms",
}

export interface TransformAggItem {
  type: TRANSFORM_AGG_TYPE;
  name: string;
  item: any | DateHistogramItem | TermsItem | HistogramItem;
  percents?: number[];
  sum?: { field: string };
  max?: { field: string };
  min?: { field: string };
  avg?: { field: string };
  value_count?: { field: string };
  percentiles?: { field: string; percents: number[] };
  scripted_metric?: object;
}

export enum TRANSFORM_AGG_TYPE {
  sum = "sum",
  max = "max",
  min = "min",
  avg = "avg",
  value_count = "value_count",
  percentiles = "percentiles",
  scripted_metric = "scripted_metric",
  terms = "terms",
  histogram = "histogram",
  date_histogram = "date_histogram",
}
export interface IAPICaller {
  endpoint: string;
  method?: string;
  data?: any;
}

export type IAliasAction = Record<string, { index: string; alias: string }>;
