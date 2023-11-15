/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from "@elastic/eui";

export interface PolicyItem {
  id: string;
  seqNo: number;
  primaryTerm: number;
  policy: object; // only dumped to view as JSON as of now, don't need to type
}

export interface PoliciesQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof PolicyItem;
  sortDirection: Direction;
}
