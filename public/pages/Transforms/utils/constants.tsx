/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SortDirection } from "../../../utils/constants";

// TODO: Consolidate with Rollup
export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: "",
  sortField: "_id",
  sortDirection: SortDirection.DESC,
};

export const EMPTY_TRANSFORM = JSON.stringify({
  transform: {
    description: "",
    groups: [],
    enabled: true,
    aggregations: {},
    data_selection_query: {},
    roles: [],
    schedule: {
      interval: {
        start_time: 234802,
        period: 1,
        unit: "MINUTES",
      },
    },
    source_index: "",
    target_index: "",
  },
});

export const ScheduleIntervalTimeunitOptions = [
  { value: "MINUTES", text: "Minute(s)" },
  { value: "HOURS", text: "Hour(s)" },
  { value: "DAYS", text: "Day(s)" },
];
