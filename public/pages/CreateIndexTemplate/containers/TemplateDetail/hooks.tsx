/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { get, set } from "lodash";
import { flatten } from "flat";
import { CoreStart } from "opensearch-dashboards/public";
import { transformArrayToObject, transformObjectToArray } from "../../../../components/IndexMapping";
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

export const simulateTemplate = (props: { template: TemplateItem; commonService: CommonService }) => {
  return props.commonService.apiCaller<{
    template: TemplateItem["template"];
  }>({
    endpoint: "transport.request",
    data: {
      method: "POST",
      path: `_index_template/_simulate`,
      body: props.template,
    },
  });
};
