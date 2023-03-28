import { CommonService } from "../../../services";
import { TemplateItemRemote } from "../../../../models/interfaces";

export const getAllUsedComponents = async ({ commonService }: { commonService: CommonService }) => {
  const allTemplatesResponse = await commonService.apiCaller<{
    index_templates?: {
      name: string;
      index_template: TemplateItemRemote;
    }[];
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: "_index_template/*",
    },
  });

  if (allTemplatesResponse && allTemplatesResponse.ok) {
    return allTemplatesResponse.response.index_templates || [];
  }

  return [];
};
