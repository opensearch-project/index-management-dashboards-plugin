/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from "opensearch-dashboards/server";
import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean) {
  const { managedIndexService } = services;

  router.get(
    {
      path: NODE_API.MANAGED_INDICES,
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          search: schema.string(),
          sortField: schema.string(),
          sortDirection: schema.string(),
          terms: schema.maybe(schema.any()),
          indices: schema.maybe(schema.any()),
          dataStreams: schema.maybe(schema.any()),
          showDataStreams: schema.boolean(),
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    managedIndexService.getManagedIndices
  );

  router.get(
    {
      path: `${NODE_API.MANAGED_INDICES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    managedIndexService.getManagedIndex
  );

  router.post(
    {
      path: NODE_API.RETRY,
      validate: {
        body: schema.any(),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    managedIndexService.retryManagedIndexPolicy
  );

  router.post(
    {
      path: NODE_API.CHANGE_POLICY,
      validate: {
        body: schema.any(),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    managedIndexService.changePolicy
  );

  router.post(
    {
      path: NODE_API.REMOVE_POLICY,
      validate: {
        body: schema.any(),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    managedIndexService.removePolicy
  );
}
