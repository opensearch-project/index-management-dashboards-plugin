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

import { CoreStart } from "opensearch-dashboards/public";
import { BrowserServices } from "../../models/interfaces";
import { ServerResponse } from "../../../server/models/types";
import { ActionType, ActionTypeMapName } from "../../pages/Notifications/constant";
import { ILronConfig } from "../../pages/Notifications/interface";

export const GetLronConfig = async (props: {
  services: BrowserServices;
  actionType: ActionType;
}): Promise<
  ServerResponse<{
    lron_configs: Array<{
      lron_config: ILronConfig;
    }>;
    total_number: number;
  }>
> => {
  return props.services.commonService.apiCaller<{
    lron_configs: Array<{
      lron_config: ILronConfig;
    }>;
    total_number: number;
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: `/_plugins/_im/lron/${encodeURIComponent(`LRON:${ActionTypeMapName[props.actionType]}`)}`,
    },
  });
};

export const checkPermissionForSubmitLRONConfig = async (props: { services: BrowserServices }) => {
  const result = await props.services.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: "PUT",
      path: `/_plugins/_im/lron/${encodeURIComponent(`LRON:${ActionTypeMapName.REINDEX}`)}?dry_run=true`,
      body: {
        lron_config: {
          lron_condition: {},
          action_name: ActionTypeMapName[ActionType.REINDEX],
          channels: [
            {
              id: "test",
            },
          ],
        },
      },
    },
  });

  return result?.ok;
};

export const associateWithTask = async (props: {
  services: BrowserServices;
  coreServices: CoreStart;
  taskId: string;
  lronConfig: ILronConfig;
}) => {
  const result = await props.services.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: "PUT",
      path: `/_plugins/_im/lron/${encodeURIComponent(`LRON:${props.taskId}`)}`,
      body: {
        lron_config: {
          ...props.lronConfig,
          task_id: props.taskId,
        } as ILronConfig,
      },
    },
  });
  if (!result.ok) {
    props.coreServices.notifications.toasts.addDanger(result.error);
  }

  return result?.ok;
};

export const ifSetDefaultNotification = (lronConfig?: ILronConfig) => {
  return !!(lronConfig?.lron_condition?.failure || lronConfig?.lron_condition?.success);
};

export const getPermissionValue = (permissionForViewLRON: boolean, permissionForCreateLRON: boolean, hasDefaultNotification: boolean) => {
  const getValue = (val: boolean) => (val ? "1" : "0");
  return `${getValue(permissionForViewLRON)}${getValue(permissionForCreateLRON)}${getValue(hasDefaultNotification)}`;
};
