/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import { htmlIdGenerator } from "@elastic/eui/lib/services";
import { isEqual } from "lodash";
import { ClusterInfo } from "../models/interfaces";
import { CommonService } from "../services";

export function getErrorMessage(err: any, defaultMessage: string) {
  if (err && err.message) return err.message;
  return defaultMessage;
}

export const makeId = htmlIdGenerator();

// Helper method to return wildcard option suggestion by checking if there's already '*' at the end.
export const wildcardOption = (searchValue: string): string => {
  return searchValue.endsWith("*") ? searchValue : `${searchValue}*`;
};

export function diffJson(oldJson?: Record<string, any>, newJson?: Record<string, any>): number {
  let initial = 0;
  const oldKeys = Object.keys(oldJson || {});
  const addOrChanged = Object.entries(newJson || {}).reduce((total, [key, value]) => {
    if (Object.prototype.toString.call(value) === "[object Object]") {
      total += diffJson(oldJson?.[key], value);
    } else {
      total += isEqual(oldJson?.[key], value) ? 0 : 1;
    }

    const findIndex = oldKeys.findIndex((item) => item === key);
    if (findIndex > -1) {
      oldKeys.splice(findIndex, 1);
    }

    return total;
  }, 0);
  /**
   * oldJson: null | undefined
   * newJson: {}
   */
  if ((oldJson === undefined || oldJson === null) && addOrChanged === 0 && newJson) {
    initial += 1;
  }
  return initial + addOrChanged + oldKeys.length;
}

export const getClusterInfo = (props: { commonService: CommonService }): Promise<ClusterInfo> => {
  return props.commonService
    .apiCaller<{
      cluster_name: string;
    }>({
      endpoint: "cluster.health",
    })
    .then((res) => {
      if (res && res.ok) {
        return {
          cluster_name: res.response.cluster_name,
        };
      }

      return {};
    });
};
