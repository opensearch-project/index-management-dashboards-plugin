import { BrowserServices } from "../../models/interfaces";
import { ServerResponse } from "../../../server/models/types";
import { ActionType, ActionTypeMapName } from "../../pages/Notifications/constant";
import { ILronConfig } from "../../pages/Notifications/interface";

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
