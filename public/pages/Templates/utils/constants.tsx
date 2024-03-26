/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { SortDirection } from "../../../utils/constants";
import { ITemplate } from "../interface";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: "0",
  size: "20",
  search: "",
  sortField: "name" as keyof ITemplate,
  sortDirection: SortDirection.DESC,
  dataSourceId: "",
  dataSourceLabel: "",
};
