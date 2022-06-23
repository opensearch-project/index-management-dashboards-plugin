/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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
  let minute = DEFAULT_CRON_MINUTE;
  let hour = DEFAULT_CRON_HOUR;
  let frequencyType = "custom";
  let dayOfWeek = DEFAULT_CRON_DAY_OF_WEEK;
  let dayOfMonth = DEFAULT_CRON_DAY_OF_MONTH;

  if (!expression) {
    return {
      hour,
      minute,
      dayOfWeek,
      dayOfMonth,
      frequencyType,
    };
  }
  const expArr = expression.split(" ");

  if (isNumber(expArr[0]) && isNumber(expArr[1])) {
    minute = parseInt(expArr[0]);
    hour = parseInt(expArr[1]);
    if (isNumber(expArr[2]) && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "monthly";
      dayOfMonth = parseInt(expArr[2]);
    }
    if (expArr[2] == "*" && expArr[3] == "*" && (isNumber(expArr[4]) || WEEK_DAYS.includes(expArr[4]))) {
      frequencyType = "weekly";
      if (isNumber(expArr[4])) {
        dayOfWeek = ["SUN", ...WEEK_DAYS][parseInt(expArr[4])];
      } else {
        dayOfWeek = expArr[4];
      }
    }
    if (expArr[2] == "*" && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "daily";
    }
  }
  if (isNumber(expArr[0])) {
    minute = parseInt(expArr[0]);
    if (expArr[1] == "*" && expArr[2] == "*" && expArr[3] == "*" && expArr[4] == "*") {
      frequencyType = "hourly";
    }
  }

  return {
    hour,
    minute,
    dayOfWeek,
    dayOfMonth,
    frequencyType,
  };
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
  let humanCron = `${startTime(hour, minute).format("h:mm a z")} (${timezone})`;
  if (frequencyType == "monthly") {
    humanCron = `Day ${dayOfMonth}, ` + humanCron;
  }
  if (frequencyType == "weekly") {
    humanCron = `${dayOfWeek}, ` + humanCron;
  }
  return humanCron;
}

function isNumber(value: any): boolean {
  return !isNaN(parseInt(value));
}

export function formatNumberToHourMin(timeNumber: number) {
  return ("0" + timeNumber).slice(-2);
}

export function startTime(hourNumber: number, minuteNumber: number): moment.Moment {
  const timeMoment = moment().hours(hourNumber).minutes(minuteNumber);
  return timeMoment;
}
