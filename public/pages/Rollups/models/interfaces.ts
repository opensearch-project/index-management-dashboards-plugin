/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from "@elastic/eui";
import { DocumentRollup } from "../../../../models/interfaces";

export interface RollupQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof DocumentRollup;
  sortDirection: Direction;
}
