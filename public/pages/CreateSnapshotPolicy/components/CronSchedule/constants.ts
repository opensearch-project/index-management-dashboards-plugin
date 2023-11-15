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
