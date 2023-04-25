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
      flow: templateDetail.composed_of?.length
        ? FLOW_ENUM.COMPONENTS
        : templateDetail._meta?.flow
        ? templateDetail._meta?.flow
        : FLOW_ENUM.SIMPLE,
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

const formatTemplateToSubmitPayload = (value: TemplateItem): Omit<TemplateItemRemote, "name"> => {
  const { name, _meta, ...others } = value;
  const bodyPayload: Omit<TemplateItemRemote, "name"> = {
    ...others,
    composed_of: _meta?.flow === FLOW_ENUM.COMPONENTS ? others.composed_of || [] : [],
    _meta,
    template: IndexForm.transformIndexDetailToRemote(others.template),
  };
  return bodyPayload;
};

export const submitTemplate = async (props: { value: TemplateItem; isEdit: boolean; commonService: CommonService }) => {
  const { name } = props.value;
  return await props.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: props.isEdit ? "POST" : "PUT",
      path: `_index_template/${name}`,
      body: formatTemplateToSubmitPayload(props.value),
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
  const { name, index_patterns, priority } = props.template;
  const payload = formatTemplateToSubmitPayload({
    ...props.template,
    /**
     * The simulate API requires a pattern
     * so we fake one that won't be matched
     */
    index_patterns: [`a_pattern_that_will_never_be_matched_for_simulate_template_${Date.now()}`],
    priority: 500,
  });
  const { template, ...others } = payload;
  return props.commonService
    .apiCaller<{
      template: TemplateItemRemote["template"];
    }>({
      endpoint: "transport.request",
      data: {
        method: "POST",
        path: `_index_template/_simulate`,
        body: payload,
      },
    })
    .then((result) => {
      if (result.ok) {
        return {
          ...result,
          response: formatRemoteTemplateToEditTemplate({
            templateDetail: {
              ...others,
              index_patterns,
              priority,
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
