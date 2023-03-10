import { get, set } from "lodash";
import { flatten } from "flat";
import { CoreStart } from "opensearch-dashboards/public";
import { CommonService } from "../../../../services";
import { IComposableTemplate, IComposableTemplateRemote, TemplateItem } from "../../../../../models/interfaces";
import { IndicesUpdateMode } from "../../../../utils/constants";
import { IndexForm } from "../../../../containers/IndexForm";

export const submitTemplate = async (props: { value: Partial<TemplateItem>; isEdit: boolean; commonService: CommonService }) => {
  const { name, template, ...others } = props.value;
  return await props.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: props.isEdit ? "POST" : "PUT",
      path: `_component_template/${name}`,
      body: {
        ...others,
        template: IndexForm.transformIndexDetailToRemote(template),
      },
    },
  });
};

export const getTemplate = async (props: { templateName: string; commonService: CommonService; coreService: CoreStart }) => {
  const response = await props.commonService.apiCaller<{
    component_templates: { name: string; component_template: IComposableTemplateRemote }[];
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: `_component_template/${props.templateName}?flat_settings=true`,
    },
  });
  let error: string = "";
  if (response.ok) {
    const findItem = response.response?.component_templates?.find((item) => item.name === props.templateName);
    if (findItem) {
      const templateDetail = findItem.component_template;

      // Opensearch core does not flattern the settings
      // do it manually.
      const payload = JSON.parse(
        JSON.stringify({
          ...templateDetail,
          name: props.templateName,
          template: IndexForm.transformIndexDetailToLocal(templateDetail.template),
        } as IComposableTemplate)
      );
      if (templateDetail.template.settings) {
        set(payload, "template.settings", flatten(get(payload, "template.settings") || {}));
      }
      const includes: IComposableTemplateRemote["includes"] = {
        [IndicesUpdateMode.alias]: !!templateDetail.template[IndicesUpdateMode.alias],
        [IndicesUpdateMode.settings]: !!templateDetail.template[IndicesUpdateMode.settings],
        [IndicesUpdateMode.mappings]: !!templateDetail.template[IndicesUpdateMode.mappings],
      };
      return JSON.parse(
        JSON.stringify({
          ...payload,
          includes,
        })
      );
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};
