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
          index: schema.string({
            pattern: /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/,
            minLength: 1,
            maxLength: 100000,
          }),
        }),
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          ...(dataSourceEnabled
            ? {
                dataSourceId: schema.string({
                  minLength: 1,
                  maxLength: 100000,
                  pattern: "^[a-zA-Z0-9_-]+$",
                }),
              }
            : {}),
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
          transform: schema.object({
            transform_id: schema.string(),
            schema_version: schema.number(),
            schedule: schema.object({
              interval: schema.object({
                start_time: schema.number(),
                period: schema.number(),
                unit: schema.string(),
              }),
            }),
            metadata_id: schema.string(),
            updated_at: schema.number(),
            enabled: schema.boolean(),
            enabled_at: schema.maybe(schema.any()),
            description: schema.maybe(schema.string()),
            source_index: schema.string({
              pattern: /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/,
              minLength: 1,
              maxLength: 100000,
            }),
            data_selection_query: schema.object({
              match_all: schema.object({
                boost: schema.maybe(schema.number()),
              }),
            }),
            target_index: schema.string({
              pattern: /^[^A-Z-_"*+/\\|?#<>][^A-Z"*+/\\|?#<>]*$/,
              minLength: 1,
              maxLength: 100000,
            }),
            page_size: schema.number(),
            groups: schema.arrayOf(
              schema.object({
                terms: schema.object({
                  source_field: schema.string(),
                  target_field: schema.string(),
                }),
              })
            ),
            aggregations: schema.maybe(schema.any()),
            continuous: schema.maybe(schema.boolean()),
          }),
        }),
        query: schema.object({
          ...(dataSourceEnabled
            ? {
                dataSourceId: schema.string({
                  minLength: 1,
                  maxLength: 100000,
                  pattern: "^[a-zA-Z0-9_-]+$",
                }),
              }
            : {}),
        }),
      },
    },
    transformService.previewTransform
  );
}
