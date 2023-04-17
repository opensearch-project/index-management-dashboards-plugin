import { EuiFormRowProps } from "@elastic/eui";
import { get, set } from "lodash";
import { flatten } from "flat";
import { CommonService } from "../../services";
import { IComposableTemplate, IComposableTemplateRemote, TemplateItem } from "../../../models/interfaces";
import { IndicesUpdateMode } from "../../utils/constants";
import { FieldInstance, transformNameToString } from "../../lib/field";
import { ComponentTemplateEdit } from "./interface";
import { IndexForm } from "../../containers/IndexForm";

export const getCommonFormRowProps = (name: string | string[], field: FieldInstance): Partial<EuiFormRowProps> => {
  return {
    isInvalid: !!field.getError(name),
    error: field.getError(name),
    "data-test-subj": `form-row-${transformNameToString(name)}`,
  };
};

export const formatTemplate = (item?: Partial<ComponentTemplateEdit>): IComposableTemplateRemote | {} => {
  if (!item) {
    return {};
  }

  const { name, includes, ...others } = item;
  return {
    ...others,
    template: IndexForm.transformIndexDetailToDiffableJSON(others.template),
  };
};

export const filterTemplateByIncludes = (value: ComponentTemplateEdit): ComponentTemplateEdit => {
  const { includes, template, ...others } = value;
  const payload: ComponentTemplateEdit = {
    ...others,
    template: {},
  };
  const templatePayload: IComposableTemplate["template"] = {};
  if (includes?.aliases) {
    templatePayload.aliases = template.aliases;
  }
  if (includes?.mappings) {
    templatePayload.mappings = template.mappings;
  }
  if (includes?.settings) {
    templatePayload.settings = template.settings;
  }
  payload.template = templatePayload;

  return payload;
};

export const formatRemoteTemplateToEditTemplate = (props: {
  templateDetail: Partial<IComposableTemplateRemote>;
  templateName: string;
}): ComponentTemplateEdit => {
  const templateDetail = props.templateDetail;

  // Opensearch core does not flattern the settings
  // do it manually.
  const payload = JSON.parse(
    JSON.stringify({
      ...templateDetail,
      name: props.templateName,
      template: IndexForm.transformIndexDetailToLocal(templateDetail.template),
    } as IComposableTemplate)
  );
  if (templateDetail.template?.settings) {
    set(
      payload,
      "template.settings",
      flatten(get(payload, "template.settings") || {}, {
        safe: true,
      })
    );
  }
  const includes: ComponentTemplateEdit["includes"] = {
    [IndicesUpdateMode.alias]: !!templateDetail.template?.[IndicesUpdateMode.alias],
    [IndicesUpdateMode.settings]: !!templateDetail.template?.[IndicesUpdateMode.settings],
    [IndicesUpdateMode.mappings]: !!templateDetail.template?.[IndicesUpdateMode.mappings],
  };

  return JSON.parse(
    JSON.stringify({
      ...payload,
      includes,
    })
  );
};

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

export const getTemplate = async (props: { templateName: string; commonService: CommonService }): Promise<ComponentTemplateEdit> => {
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

      return formatRemoteTemplateToEditTemplate({
        templateDetail,
        templateName: props.templateName,
      });
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  throw new Error(error);
};
