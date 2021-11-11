/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";

export function getErrorMessage(err: any, defaultMessage: string) {
  if (err && err.message) return err.message;
  return defaultMessage;
}

export const makeId = htmlIdGenerator();

// Helper method to return wildcard option suggestion by checking if there's already '*' at the end.
export const wildcardOption = (searchValue: string): string => {
  return searchValue.endsWith("*") ? searchValue : `${searchValue}*`;
};
