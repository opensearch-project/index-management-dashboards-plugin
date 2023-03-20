/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiFormRowProps } from "@elastic/eui";
import { FieldInstance, transformNameToString } from "../../lib/field";
import { IndexForm } from "../../containers/IndexForm";
import { TemplateItem, TemplateItemRemote } from "../../../models/interfaces";
import { TemplateItemEdit, FLOW_ENUM } from "./interface";
import { get, set } from "lodash";
import { flatten } from "flat";
import { CoreStart } from "opensearch-dashboards/public";
import { transformArrayToObject, transformObjectToArray } from "../../components/IndexMapping";
import { CommonService } from "../../services";

export const getCommonFormRowProps = (name: string | string[], field: FieldInstance): Partial<EuiFormRowProps> => {
  return {
    isInvalid: !!field.getError(name),
    error: field.getError(name),
    "data-test-subj": `form-row-${transformNameToString(name)}`,
  };
};

export const formatTemplate = (item?: Partial<TemplateItemEdit>): TemplateItemRemote | {} => {
  if (!item) {
    return {};
  }

  return {
    ...item,
    template: IndexForm.transformIndexDetailToDiffableJSON(item.template),
  };
};

export const formatRemoteTemplateToEditTemplate = (props: { templateDetail: Partial<TemplateItemRemote> }): TemplateItemEdit => {
  const templateDetail = props.templateDetail;

  // Opensearch dashboard core does not flattern the settings
  // do it manually.
  const payload = {
    ...templateDetail,
    priority: templateDetail.priority + "",
    template: IndexForm.transformIndexDetailToLocal(templateDetail.template),
    _meta: {
      ...templateDetail._meta,
      flow: templateDetail.composed_of?.length ? FLOW_ENUM.COMPONENTS : FLOW_ENUM.SIMPLE,
    },
  };
  if (templateDetail.template?.settings) {
    set(
      payload,
      "template.settings",
      flatten(get(payload, "template.settings") || {}, {
        safe: true,
      })
    );
  }
  return JSON.parse(JSON.stringify(payload));
};

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

export const getTemplate = async (props: {
  templateName: string;
  commonService: CommonService;
  coreService: CoreStart;
}): Promise<TemplateItemEdit> => {
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
      templateDetail.name = props.templateName;

      return formatRemoteTemplateToEditTemplate({
        templateDetail,
      });
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};

export const simulateTemplate = (props: { template: TemplateItem; commonService: CommonService }) => {
  const payload = {
    ...props.template,
    index_patterns: ["test-*"],
    priority: 500,
    template: IndexForm.transformIndexDetailToRemote(props.template.template),
  } as TemplateItemRemote;
  const { name, ...others } = payload;
  return props.commonService
    .apiCaller<{
      template: TemplateItemRemote["template"];
    }>({
      endpoint: "transport.request",
      data: {
        method: "POST",
        path: `_index_template/_simulate`,
        body: others,
      },
    })
    .then((result) => {
      if (result.ok) {
        return {
          ...result,
          response: formatRemoteTemplateToEditTemplate({
            templateDetail: {
              ...props.template,
              name,
              template: result.response.template,
            },
          }),
        };
      } else {
        return result;
      }
    });
};
