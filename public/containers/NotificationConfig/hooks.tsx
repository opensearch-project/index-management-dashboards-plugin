import { BrowserServices } from "../../models/interfaces";
import { ServerResponse } from "../../../server/models/types";
import { ActionType, ActionTypeMapName } from "../../pages/Notifications/constant";
import { ILronConfig } from "../../pages/Notifications/interface";
import { CoreStart } from "opensearch-dashboards/public";

export const GetLronConfig = async (props: {
  services: BrowserServices;
  actionType: ActionType;
}): Promise<
  ServerResponse<{
    lron_configs: {
      lron_config: ILronConfig;
    }[];
    total_number: number;
  }>
> => {
  return props.services.commonService.apiCaller<{
    lron_configs: {
      lron_config: ILronConfig;
    }[];
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
