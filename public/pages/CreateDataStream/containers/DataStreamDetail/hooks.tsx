import { get, set } from "lodash";
import { flatten } from "flat";
import { CoreStart } from "opensearch-dashboards/public";
import { transformArrayToObject, transformObjectToArray } from "../../../CreateIndex/components/IndexMapping";
import { CommonService } from "../../../../services";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";

export const submitTemplate = async (props: { value: TemplateItem; isEdit: boolean; commonService: CommonService }) => {
  const { name, ...others } = props.value;
  const bodyPayload = JSON.parse(JSON.stringify(others));
  set(bodyPayload, "template.mappings.properties", transformArrayToObject(props.value.template?.mappings?.properties || []));
  return await props.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: props.isEdit ? "POST" : "PUT",
      path: `_index_template/${name}`,
      body: bodyPayload,
    },
  });
};

export const getTemplate = async (props: { templateName: string; commonService: CommonService; coreService: CoreStart }) => {
  const response = await props.commonService.apiCaller<{
    index_templates: { name: string; index_template: TemplateItemRemote }[];
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: `_index_template/${props.templateName}?flat_settings=true`,
    },
  });
  let error: string = "";
  if (response.ok) {
    const findItem = response.response?.index_templates?.find((item) => item.name === props.templateName);
    if (findItem) {
      const templateDetail = findItem.index_template;

      // Opensearch dashboard core does not flattern the settings
      // do it manually.
      const payload = {
        ...templateDetail,
        name: props.templateName,
      };
      set(payload, "template.mappings.properties", transformObjectToArray(get(payload, "template.mappings.properties", {})));
      set(payload, "template.settings", flatten(get(payload, "template.settings") || {}));
      return JSON.parse(JSON.stringify(payload));
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};

export const getAllDataStreamTemplate = (props: {
  commonService: CommonService;
}): Promise<
  {
    name: string;
    index_template: TemplateItemRemote;
  }[]
> => {
  return props.commonService
    .apiCaller<{
      index_templates?: {
        name: string;
        index_template: TemplateItemRemote;
      }[];
    }>({
      data: {
        method: "GET",
        path: "_index_template/*",
      },
      endpoint: "transport.request",
    })
    .then((result) => {
      if (result && result.ok) {
        return (result.response.index_templates || []).filter((item) => item.index_template.data_stream);
      }

      return [];
    });
};
