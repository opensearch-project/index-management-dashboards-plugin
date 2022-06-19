/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isNumber } from "lodash";
import moment from "moment-timezone";
import { WEEK_DAYS } from "./constants";

export interface CronUIParts {
  hour: number;
  minute: number;
  dayOfWeek: string;
  dayOfMonth: number;
  frequencyType: "custom" | "monthly" | "weekly" | "daily" | "hourly" | string;
}

export const DEFAULT_CRON_DAY_OF_WEEK = "SUN";
export const DEFAULT_CRON_DAY_OF_MONTH = 1;
export const DEFAULT_CRON_MINUTE = 0;
export const DEFAULT_CRON_HOUR = 20;

export function parseCronExpression(expression: string): CronUIParts {
  const expArr = expression.split(" ");
  let minute = formatNumberToHourMin(DEFAULT_CRON_MINUTE);
  let hour = formatNumberToHourMin(DEFAULT_CRON_HOUR);
  let frequencyType = "custom";
  let dayOfWeek = DEFAULT_CRON_DAY_OF_WEEK;
  let dayOfMonth = DEFAULT_CRON_DAY_OF_MONTH;

  if (isNumber(expArr[0]) && isNumber(expArr[1])) {
    minute = ("0" + expArr[0]).slice(-2);
    hour = ("0" + expArr[1]).slice(-2);
    if (isNumber(expArr[2]) && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "monthly";
      dayOfMonth = parseInt(expArr[2]);
    }
    if (expArr[2] == "*" && expArr[3] == "*" && (isNumber(expArr[4]) || WEEK_DAYS.includes(expArr[4]))) {
      frequencyType = "weekly";
      dayOfWeek = expArr[4];
    }
    if (expArr[2] == "*" && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "daily";
    }
  }
  if (isNumber(expArr[0])) {
    minute = ("0" + expArr[0]).slice(-2);
    if (expArr[1] == "*" && expArr[2] == "*" && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "hourly";
    }
  }

  const minuteNumber = parseInt(minute);
  const hourNumber = parseInt(hour);

  return {
    hour: hourNumber,
    minute: minuteNumber,
    dayOfWeek,
    dayOfMonth,
    frequencyType,
  };
}

export function formatNumberToHourMin(timeNumber: number) {
  return ("0" + timeNumber).slice(-2);
}

export function startTime(hourNumber: number, minuteNumber: number): moment.Moment {
  const minute = formatNumberToHourMin(minuteNumber);
  const hour = formatNumberToHourMin(hourNumber);
  const timeStr = `2022-01-01 ${hour}:${minute}`;
  return moment(timeStr);
}

export function buildCronExpression(cronParts: CronUIParts, expression: string): string {
  const minute = cronParts.minute;
  const hour = cronParts.hour;

  switch (cronParts.frequencyType) {
    case "hourly": {
      return `${minute} * * * *`;
    }
    case "daily": {
      return `${minute} ${hour} * * *`;
    }
    case "weekly": {
      return `${minute} ${hour} * * ${cronParts.dayOfWeek}`;
    }
    case "monthly": {
      return `${minute} ${hour} ${cronParts.dayOfMonth} * *`;
    }
    case "custom": {
      return expression;
    }
  }
  throw new Error(`Unknown schedule frequency type ${cronParts.frequencyType}.`);
}

export function humanCronExpression(
  { hour, minute, dayOfWeek, dayOfMonth, frequencyType }: CronUIParts,
  expression: string,
  timezone: string
): string {
  if (frequencyType == "custom") {
    return expression + ` (${timezone})`;
  }
  let humanCron = `${hour}:${minute} (${timezone})`;
  if (frequencyType == "monthly") {
    humanCron = `Day ${dayOfMonth} ` + startTime;
  }
  if (frequencyType == "weekly") {
    humanCron = `${dayOfWeek} ` + startTime;
  }
  return humanCron;
}
