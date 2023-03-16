/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreStart } from "opensearch-dashboards/public";
import { CommonService } from "../../../services";
import { TemplateItem, TemplateItemRemote } from "../../../../models/interfaces";

export const getTemplate = async (props: {
  templateName: string;
  commonService: CommonService;
  coreService: CoreStart;
}): Promise<TemplateItem> => {
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
      return JSON.parse(JSON.stringify(templateDetail));
    }
    error = `The template [${props.templateName}] does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};
