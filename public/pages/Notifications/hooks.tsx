/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommonService } from "../../services";
import { ActionTypeMapName, ActionTypeMapTitle } from "./constant";
import { ILronConfig, ILronPlainConfig } from "./interface";

export const transformConfigListToPlainList = (config: ILronConfig[]): ILronPlainConfig[] => {
  return Object.entries(ActionTypeMapName).map(([actionType, action_name], index) => {
    const findItem =
      config.find((c) => c.action_name === action_name) ||
      ({
        lron_condition: {
          failure: false,
          success: false,
        },
        action_name: action_name,
        channels: [],
      } as ILronConfig);
    const { lron_condition, ...rest } = findItem;
    return {
      ...lron_condition,
      ...rest,
      index,
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
