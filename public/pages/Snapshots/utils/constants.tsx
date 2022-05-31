/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiTableFieldDataColumnType } from "@elastic/eui";
import { CatSnapshot } from "../../../../server/models/interfaces";
import { SortDirection } from "../../../utils/constants";
import moment from "moment";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  sortField: "id",
  sortDirection: SortDirection.DESC,
  search: "",
};

export const renderTimestampSecond = (time: number): string => {
  const momentTime = moment.unix(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};

export const SNAPSHOTS_COLUMNS: EuiTableFieldDataColumnType<CatSnapshot>[] = [
  {
    field: "id",
    name: "Name",
    sortable: true,
    dataType: "string",
  },
  {
    field: "repository",
    name: "Repository",
    sortable: true,
    dataType: "string",
  },
  {
    field: "status",
    name: "Status",
    sortable: true,
    dataType: "string",
  },
  {
    field: "start_epoch",
    name: "Start time",
    sortable: true,
    dataType: "date",
    render: renderTimestampSecond,
  },
  {
    field: "end_epoch",
    name: "End time",
    sortable: true,
    dataType: "date",
    render: renderTimestampSecond,
  },
];

export const DEFAULT_SM_POLICY = JSON.stringify({
  description: "",
  enabled: true,
  creation: {
    schedule: {
      cron: {
        expression: "0 20 * * *",
        timezone: "America/Los_Angeles",
      },
    },
    time_limit: undefined,
  },
  deletion: {
    schedule: {
      cron: {
        expression: "0 1 * * *",
        timezone: "America/Los_Angeles",
      },
    },
    time_limit: undefined,
    condition: {
      max_count: 50,
      max_age: undefined,
      min_count: undefined,
    },
  },
  snapshot_config: {
    indices: undefined,
    repository: undefined,
    ignore_unavailable: false,
    include_global_state: false,
    partial: false,
    date_expression: "{now/d}",
  },
});

export const DEFAULT_DELETE_CONDITION = {
  max_count: 50,
  max_age: "",
  min_count: 5,
};
