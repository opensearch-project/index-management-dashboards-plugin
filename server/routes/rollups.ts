/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from "opensearch-dashboards/server";
import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean) {
  const { rollupService, transformService } = services;

  router.get(
    {
      path: NODE_API.ROLLUPS,
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
    rollupService.getRollups
  );

  router.put(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
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
    rollupService.putRollup
  );

  router.get(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    rollupService.getRollup
  );

  router.delete(
    {
      path: `${NODE_API.ROLLUPS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    rollupService.deleteRollup
  );

  router.post(
    {
      path: `${NODE_API.ROLLUPS}/{id}/_start`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    rollupService.startRollup
  );

  router.post(
    {
      path: `${NODE_API.ROLLUPS}/{id}/_stop`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    rollupService.stopRollup
  );

  router.post(
    {
      path: NODE_API._MAPPINGS,
      validate: {
        body: schema.any(),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    rollupService.getMappings
  );
}
