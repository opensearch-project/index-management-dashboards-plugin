/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommonService } from "../../services";
import { ActionTypeMapName, ActionTypeMapTitle, getKeyByValue } from "./constant";
import { ILronConfig, ILronPlainConfig } from "./interface";

export const transformConfigListToPlainList = (config: ILronConfig[]): ILronPlainConfig[] => {
  return config.map((c) => {
    const { lron_condition, ...rest } = c;
    const actionType = getKeyByValue(ActionTypeMapName, c.action_name);
    return {
      ...lron_condition,
      ...rest,
      title: actionType ? ActionTypeMapTitle[actionType] : "",
    };
  });
};

export const getComputedResultFromPlainList = (
  plainConfigs: ILronPlainConfig[]
): {
  useDifferentSettings: boolean;
} => {
  return {
    useDifferentSettings: !Object.values(ActionTypeMapName).every((c) => {
      const findItem = plainConfigs.find((p) => p.action_name === c) || ({} as ILronPlainConfig);
      console.log(findItem);
      console.log(plainConfigs[0]);
      return findItem.success === plainConfigs[0].failure && findItem.success === plainConfigs[0].success;
    }),
  };
};

export const getNotifications = async (props: { commonService: CommonService }) => {
  return props.commonService.apiCaller<{
    lron_configs: {
      lron_config: ILronConfig;
    }[];
    total_number: number;
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: "/_plugins/_im/lron",
    },
  });
};
