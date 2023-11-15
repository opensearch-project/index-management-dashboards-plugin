/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from "@elastic/eui";
import { ManagedIndexItem } from "../../../../models/interfaces";

export interface ManagedIndicesQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof ManagedIndexItem;
  sortDirection: Direction;
  showDataStreams: boolean;
}
