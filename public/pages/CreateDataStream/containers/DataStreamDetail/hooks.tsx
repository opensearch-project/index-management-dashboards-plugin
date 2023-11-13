/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreStart } from "opensearch-dashboards/public";
import { CommonService } from "../../../../services";
import { TemplateItemRemote } from "../../../../../models/interfaces";
import { DataStream } from "../../../../../server/models/interfaces";

export const createDataStream = async (props: { value: string; isEdit: boolean; commonService: CommonService }) => {
  return await props.commonService.apiCaller({
    endpoint: "transport.request",
    data: {
      method: "PUT",
      path: `_data_stream/${props.value}`,
    },
  });
};

export const getDataStream = async (props: { dataStream: string; commonService: CommonService; coreService: CoreStart }) => {
  const response = await props.commonService.apiCaller<{
    data_streams: DataStream[];
  }>({
    endpoint: "transport.request",
    data: {
      method: "GET",
      path: `_data_stream/${props.dataStream}`,
    },
  });
  let error: string = "";
  if (response.ok) {
    const findItem = response.response?.data_streams?.find((item) => item.name === props.dataStream);
    if (findItem) {
      const dataStreamDetail = findItem;

      return JSON.parse(JSON.stringify(dataStreamDetail));
    }
    error = `The data stream ${props.dataStream} does not exist.`;
  } else {
    error = response.error || "";
  }

  props.coreService.notifications.toasts.addDanger(error);
  throw new Error(error);
};

export const getAllDataStreamTemplate = (props: {
  commonService: CommonService;
}): Promise<
  Array<{
    name: string;
    index_template: TemplateItemRemote;
  }>
> => {
  return props.commonService
    .apiCaller<{
      index_templates?: Array<{
        name: string;
        index_template: TemplateItemRemote;
      }>;
    }>({
      data: {
        method: "GET",
        path: "/_index_template/*",
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
