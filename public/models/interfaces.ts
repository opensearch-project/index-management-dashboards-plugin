/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, Query } from "@elastic/eui";
import { SMPolicy } from "../../models/interfaces";
import { IJobItemMetadata } from "../lib/JobScheduler";
import {
  IndexService,
  ManagedIndexService,
  PolicyService,
  RollupService,
  TransformService,
  NotificationService,
  SnapshotManagementService,
  CommonService,
} from "../services";

export interface BrowserServices {
  indexService: IndexService;
  managedIndexService: ManagedIndexService;
  policyService: PolicyService;
  rollupService: RollupService;
  transformService: TransformService;
  notificationService: NotificationService;
  snapshotManagementService: SnapshotManagementService;
  commonService: CommonService;
}

export interface SMPoliciesQueryParams {
  from: number;
  size: number;
  sortField: keyof SMPolicy;
  sortOrder: Direction;
}

interface ArgsWithQuery {
  query: Query;
  queryText: string;
  error: null;
}
interface ArgsWithError {
  query: null;
  queryText: string;
  error: Error;
}
export type OnSearchChangeArgs = ArgsWithQuery | ArgsWithError;

export interface Toast {
  id?: string;
  title?: string;
  iconType?: string;
  color: string;
  text?: JSX.Element;
}

export interface Column {
  field: string;
  name: string;
  width: string;
  truncateText?: boolean;
  sortable: boolean;
}

export interface RestoreError {
  reason?: string;
  type?: string;
  ok?: boolean;
  error?: string;
}

export interface LatestActivities {
  activityType: "Creation" | "Deletion";
  status?: string;
  snapshot?: string;
  start_time?: number;
  end_time?: number;
  info?: {
    message?: string;
    cause?: string;
  };
}

export enum RESTORE_OPTIONS {
  restore_specific_indices = "restore_specific_indices",
  restore_all_indices = "restore_all_indices",
  do_not_rename = "do_not_rename",
  add_prefix = "add_prefix",
  rename_indices = "rename_indices",
  restore_aliases = "restore_aliases",
  include_global_state = "include_global_state",
  ignore_unavailable = "ignore_unavailable",
  partial = "partial",
  customize_index_settings = "customize_index_settings",
  ignore_index_settings = "ignore_index_settings",
}

export interface ModifiedStages {
  START: string;
  INIT: string;
  INDEX: string;
  VERIFY_INDEX: string;
  TRANSLOG: string;
  FINALIZE: string;
  DONE: string;
}

export interface IndexItem {
  index: string;
  restore_status?: string;
}
export interface ReindexJobMetaData extends IJobItemMetadata {
  extras: {
    toastId: string;
    sourceIndex: string;
    destIndex: string;
    writingIndex: string;
    taskId: string;
    destType: "index" | "other";
  };
}

export interface RecoveryJobMetaData extends IJobItemMetadata {
  extras: {
    toastId: string;
    sourceIndex: string;
    destIndex: string;
    taskId: string;
  };
}
