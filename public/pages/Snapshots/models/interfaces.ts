/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, Query, ArgsWithQuery, ArgsWithError } from "@elastic/eui";
import { CatSnapshot } from "../../../../server/models/interfaces";
import { SMPolicy } from "../../../../models/interfaces";

export interface SnapshotsQueryParams {
  from: number;
  size: number;
  sortField: keyof CatSnapshot;
  sortDirection: Direction;
}

export interface SMPoliciesQueryParams {
  from: number;
  size: number;
  sortField: keyof SMPolicy;
  sortDirection: Direction;
}

export type OnSearchChangeArgs = ArgsWithQuery | ArgsWithError;
