/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, Query, ArgsWithQuery, ArgsWithError } from "@elastic/eui";
import { CatSnapshot } from "../../../../server/models/interfaces";

export interface SnapshotItem {
  id: string;
  status: string;
  start_epoch: number;
  end_epoch: number;
  duration: string;
  indices: number;
  successful_shards: number;
  failed_shards: number;
  total_shards: number;
  repository: string;
}

export interface SnapshotsQueryParams {
  from: number;
  size: number;
  sortField: keyof CatSnapshot;
  sortDirection: Direction;
}

export type OnSearchChangeArgs = ArgsWithQuery | ArgsWithError;
