/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SMPolicy } from "../../../models/interfaces";

/**
 * Every time Component init we want to give a different default object
 */
export const getDefaultSMPolicy = (): SMPolicy => ({
  name: "",
  description: "",
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

export const maxAgeUnitOptions = [
  { value: "d", text: "Days" },
  { value: "h", text: "Hours" },
];

export const DEFAULT_INDEX_OPTIONS = [{ label: "*" }];

export const ERROR_PROMPT = {
  NAME: "Name must be provided.",
  REPO: "Repository must be provided.",
  TIMEZONE: "Time zone must be provided.",
};
