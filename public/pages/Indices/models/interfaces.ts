/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from "@elastic/eui";
import { Policy } from "../../../../models/interfaces";
import { ManagedCatIndex } from "../../../../server/models/interfaces";

export interface PolicyOption {
  label: string;
  policy?: Policy;
}

export interface IndicesQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof ManagedCatIndex;
  sortDirection: Direction;
  showDataStreams: boolean;
  dataSourceId: string;
}
