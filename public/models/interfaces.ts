/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, Query } from "@elastic/eui";
import { SMPolicy } from "../../models/interfaces";
import {
  IndexService,
  ManagedIndexService,
  PolicyService,
  RollupService,
  TransformService,
  NotificationService,
  SnapshotManagementService,
} from "../services";

export interface BrowserServices {
  indexService: IndexService;
  managedIndexService: ManagedIndexService;
  policyService: PolicyService;
  rollupService: RollupService;
  transformService: TransformService;
  notificationService: NotificationService;
  snapshotManagementService: SnapshotManagementService;
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
