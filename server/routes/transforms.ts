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

import { IRouter } from "opensearch-dashboards/server";
import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter) {
  const { transformService } = services;

  router.get(
    {
      path: NODE_API.TRANSFORMS,
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          search: schema.string(),
          sortField: schema.string(),
          sortDirection: schema.string(),
        }),
      },
    },
    transformService.getTransforms
  );

  router.get(
    {
      path: `${NODE_API.TRANSFORMS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    transformService.getTransform
  );

  router.post(
    {
      path: `${NODE_API.TRANSFORMS}/{id}/_stop`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    transformService.stopTransform
  );

  router.post(
    {
      path: `${NODE_API.TRANSFORMS}/{id}/_start`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    transformService.startTransform
  );

  router.delete(
    {
      path: `${NODE_API.TRANSFORMS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    transformService.deleteTransform
  );

  router.put(
    {
      path: `${NODE_API.TRANSFORMS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          seqNo: schema.maybe(schema.number()),
          primaryTerm: schema.maybe(schema.number()),
        }),
        body: schema.any(),
      },
    },
    transformService.putTransform
  );

  router.post(
    {
      path: `${NODE_API._SEARCH_SAMPLE_DATA}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
        }),
        body: schema.any(),
      },
    },
    transformService.searchSampleData
  );

  router.post(
    {
      path: `${NODE_API.TRANSFORMS}/_preview`,
      validate: {
        body: schema.object({
          transform: schema.any(),
        }),
      },
    },
    transformService.previewTransform
  );
}
