/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SortDirection } from "../../../utils/constants";
import moment from "moment";
import { SMPolicy, Snapshot } from "../../../../models/interfaces";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  sortOrder: SortDirection.DESC,
  search: "",
};

export const renderTimestampMillis = (time?: number): string => {
  if (time == null) return "-";
  const momentTime = moment(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};

export const renderTimestampSecond = (time: number): string => {
  const momentTime = moment.unix(time).local();
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};

/**
 * Every time Component init we want to give a different default object
 */
export const getDefaultSMPolicy = (): SMPolicy => ({
  name: "",
  description: "Snapshot management policy.",
  enabled: true,
  creation: {
    schedule: {
      cron: {
        expression: "0 20 * * *",
        timezone: "America/Los_Angeles",
      },
    },
  },
  snapshot_config: {
    repository: "",
    // ignore_unavailable: false,
    // include_global_state: false,
    // partial: false,
    // date_expression: "yyyy-MM-dd-HH:mm",
  },
});

export const DEFAULT_INDEX_OPTIONS = [{ label: "*" }, { label: "-.opendistro_security" }];

export const getEmptySnapshot = (): Snapshot => ({
  indices: "",
  ignore_unavailable: false,
  include_global_state: false,
  partial: false,
});

export const DEFAULT_DELETE_CONDITION = {
  max_age: "7d",
  min_count: 1,
};

export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const PROMPT_TEXT = {
  NO_POLICIES: "There are no existing policies.",
  LOADING: "Loading policies...",
};

export const ERROR_PROMPT = {
  REPO: "Repository must be provided.",
};
