/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManagedIndicesQueryParams } from "../models/interfaces";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_QUERY_PARAMS: ManagedIndicesQueryParams = {
  from: 0,
  size: 20,
  search: "",
  sortField: "index",
  sortDirection: "desc",
  showDataStreams: false,
};
