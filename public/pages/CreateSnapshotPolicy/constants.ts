/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
        timezone: "UTC",
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

export const DEFAULT_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
export const DEFAULT_DATE_FORMAT_TIMEZONE = "UTC";
