/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoliciesQueryParams } from "../models/interfaces";
import { SortDirection } from "../../../utils/constants";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_QUERY_PARAMS: PoliciesQueryParams = {
  from: 0,
  size: 20,
  search: "",
  sortField: "id",
  sortDirection: SortDirection.DESC,
};
