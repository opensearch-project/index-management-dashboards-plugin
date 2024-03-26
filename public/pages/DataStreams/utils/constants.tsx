/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { DataStream } from "../../../../server/models/interfaces";
import { SortDirection } from "../../../utils/constants";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: "0",
  size: "20",
  search: "",
  sortField: "name" as keyof DataStream,
  sortDirection: SortDirection.DESC,
  dataSourceId: "",
  dataSourceLabel: "",
};

export const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
} = {
  green: "success",
  yellow: "warning",
  red: "danger",
};
