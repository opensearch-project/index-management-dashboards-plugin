/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CommonService } from "../../services";
import { ActionType, ActionTypeMapName, ActionTypeMapTitle } from "./constant";
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
      title: actionType ? ActionTypeMapTitle[actionType as ActionType] : "",
    };
  });
};

export const transformPlainListToConfigList = (config: ILronPlainConfig[]): ILronConfig[] => {
  return Object.entries(ActionTypeMapName).map(([actionType, action_name], currentIndex) => {
    const findItem =
      config.find((c) => c.action_name === action_name) ||
      ({
        failure: false,
        success: false,
        action_name: action_name,
        title: ActionTypeMapTitle[actionType as ActionType],
        channels: [],
        index: currentIndex,
      } as ILronPlainConfig);
    const { failure, success, index, title, ...rest } = findItem;
    return {
      ...rest,
      lron_condition: {
        failure,
        success,
      },
    } as ILronConfig;
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

export const getDiffableMapFromPlainList = (plainConfigs: ILronPlainConfig[]): Record<string, ILronPlainConfig> => {
  return plainConfigs.reduce(
    (total, current) => ({
      ...total,
      [current.action_name as string]: current,
    }),
    {}
  );
};

export const submitNotifications = async (props: { commonService: CommonService; plainConfigsPayload: ILronPlainConfig[] }) => {
  return Promise.all(
    transformPlainListToConfigList(props.plainConfigsPayload).map((item) => {
      const { action_name } = item;
      return props.commonService.apiCaller<unknown>({
        endpoint: "transport.request",
        data: {
          method: "PUT",
          path: `/_plugins/_im/lron/${encodeURIComponent(`LRON:${action_name}`)}`,
          body: {
            lron_config: item,
          },
        },
      });
    })
  ).then((allResults) => {
    return {
      ok: allResults.every((item) => item.ok),
      body: allResults.filter((item) => item.body).map((item) => item.body),
      error: allResults
        .filter((item) => !item.ok)
        .map((item) => item.error)
        .join(", "),
    };
  });
};

export const getNotifications = async (props: { commonService: CommonService }) => {
  return props.commonService
    .apiCaller<{
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
    })
    .then((res) => {
      if (res.ok) {
        return res;
      } else if (res.body?.error?.type === "index_not_found_exception") {
        return {
          ok: true,
          response: {
            lron_configs: [],
            total_number: 0,
          },
          error: "",
          body: {},
        };
      } else {
        return res;
      }
    });
};
