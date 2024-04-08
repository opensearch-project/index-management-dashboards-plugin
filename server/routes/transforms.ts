/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeServices } from "../models/interfaces";
import { IRouter } from "opensearch-dashboards/server";
import { NODE_API } from "../../utils/constants";
import { schema } from "@osd/config-schema";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean) {
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
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
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
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    transformService.previewTransform
  );
}
