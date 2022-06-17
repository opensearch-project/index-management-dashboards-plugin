/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from "query-string";
import { SMPoliciesQueryParams } from "../models/interfaces";
import { DEFAULT_QUERY_PARAMS, PROMPT_TEXT, WEEK_DAYS } from "../utils/constants";

export function getSMPoliciesQueryParamsFromURL(location: { search: string }): SMPoliciesQueryParams {
  const { from, size, sortField, sortOrder, search } = queryString.parse(location.search);
  return <SMPoliciesQueryParams>{
    // @ts-ignore
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    // @ts-ignore
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search: typeof search !== "string" ? DEFAULT_QUERY_PARAMS.search : search,
    sortField: typeof sortField !== "string" ? "name" : sortField,
    sortOrder: typeof sortOrder !== "string" ? DEFAULT_QUERY_PARAMS.sortOrder : sortOrder,
  };
}

export function isNumber(str: string): boolean {
  return !isNaN(parseInt(str));
}

export interface CronExpressionConstructs {
  minute: string;
  hour: string;
  dayOfWeek: string;
  dayOfMonth: number;
  frequencyType: "custom" | "monthly" | "weekly" | "daily" | "hourly" | string;
}

export function parseCronExpression(expression: string): CronExpressionConstructs {
  const expArr = expression.split(" ");
  let minute = "00";
  let hour = "01";
  let frequencyType = "custom";
  let dayOfWeek = "SUN";
  let dayOfMonth = 1;

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

  return {
    minute,
    hour,
    dayOfWeek,
    dayOfMonth,
    frequencyType,
  };
}

export function humanCronExpression(
  { minute, hour, dayOfWeek, dayOfMonth, frequencyType }: CronExpressionConstructs,
  expression: string,
  timezone: string
): string {
  if (frequencyType == "custom") {
    return expression + ` (${timezone})`;
  }
  let startTime = `${hour}:${minute} (${timezone})`;
  if (frequencyType == "monthly") {
    startTime = `Day ${dayOfMonth} ` + startTime;
  }
  if (frequencyType == "weekly") {
    startTime = `${dayOfWeek} ` + startTime;
  }
  return startTime;
}

export function buildCronExpressionFromState(startTime: moment.Moment, type: string, dayOfWeek: string, dayOfMonth: number): string {
  const minute = startTime.minute();
  const hour = startTime.hour();
  console.log(`sm dev start time minute hour ${minute}, ${hour}`);
  switch (type) {
    case "hourly": {
      return `${minute} * * * *`;
    }
    case "daily": {
      return `${minute} ${hour} * * *`;
    }
    case "weekly": {
      return `${minute} ${hour} * * ${dayOfWeek}`;
    }
    case "monthly": {
      return `${minute} ${hour} ${dayOfMonth} * *`;
    }
  }
  throw new Error(`Unknown schedule frequency type ${type}.`);
}

export const getMessagePrompt = (loading: boolean) => {
  if (loading) return PROMPT_TEXT.LOADING;
  return PROMPT_TEXT.NO_POLICIES;
};
