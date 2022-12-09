import { useContext } from "react";

import { transformArrayToObject, transformObjectToArray } from "../../../CreateIndex/components/IndexMapping";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import { get, set } from "lodash";

export const submitTemplate = async (props: { value: TemplateItem; isEdit: boolean }) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const { name, ...others } = props.value;
  const bodyPayload = JSON.parse(JSON.stringify(others));
  set(bodyPayload, "template.mappings.properties", transformArrayToObject(props.value.template?.mappings?.properties || []));
  return await services.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: props.isEdit ? "POST" : "PUT",
      path: `_index_template/${name}`,
      body: bodyPayload,
    },
  });
};

export const getTemplate = async (props: { templateName: string }) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreContext = useContext(CoreServicesContext) as CoreStart;
  const response = await services.commonService.apiCaller<Record<string, TemplateItemRemote>>({
    endpoint: "indices.get",
    data: {
      index: props.templateName,
      flat_settings: true,
    },
  });
  if (response.ok) {
    const templateDetail = response.response[props.templateName];
    const payload = {
      ...templateDetail,
    };
    set(payload, "template.mappings.properties", transformObjectToArray(get(payload, "template.mappings.properties", {})));
    return JSON.parse(JSON.stringify(payload));
  }

  coreContext.notifications.toasts.addDanger(response.error || "");
  throw new Error(response.error);
};
