/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, ArgsWithQuery, ArgsWithError } from "@elastic/eui";
import { CatSnapshotWithRepoAndPolicy } from "../../../../server/models/interfaces";
import { SMPolicy } from "../../../../models/interfaces";

export interface SnapshotsQueryParams {
  from: number;
  size: number;
  sortField: keyof CatSnapshotWithRepoAndPolicy;
  sortDirection: Direction;
}

export interface SMPoliciesQueryParams {
  from: number;
  size: number;
  sortField: keyof SMPolicy;
  sortOrder: Direction;
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
