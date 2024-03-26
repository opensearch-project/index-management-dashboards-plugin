/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { SortDirection } from "../../../utils/constants";
import { IAlias } from "../interface";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: "0",
  size: "20",
  search: "",
  sortField: "alias" as keyof IAlias,
  sortDirection: SortDirection.DESC,
  status: "",
  dataSourceId: "",
  dataSourceLabel: "",
};
