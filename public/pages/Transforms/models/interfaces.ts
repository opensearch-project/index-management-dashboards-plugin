/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from "@elastic/eui";
import { DocumentTransform } from "../../../../models/interfaces";

export interface TransformQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof DocumentTransform;
  sortDirection: Direction;
}
