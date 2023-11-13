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

import moment from "moment-timezone";

export const CRON_SCHEDULE_FREQUENCY_TYPE = [
  { value: "hourly", text: "Hourly" },
  { value: "daily", text: "Daily" },
  { value: "weekly", text: "Weekly" },
  { value: "monthly", text: "Monthly" },
  { value: "custom", text: "Custom (Cron expression)" },
];

export const TIMEZONES = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
