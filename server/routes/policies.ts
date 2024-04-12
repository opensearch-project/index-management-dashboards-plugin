/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from "opensearch-dashboards/server";
import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean) {
  const { policyService } = services;

  router.get(
    {
      path: NODE_API.POLICIES,
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
    policyService.getPolicies
  );

  router.put(
    {
      path: `${NODE_API.POLICIES}/{id}`,
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
    policyService.putPolicy
  );

  router.get(
    {
      path: `${NODE_API.POLICIES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    policyService.getPolicy
  );

  router.delete(
    {
      path: `${NODE_API.POLICIES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ...(dataSourceEnabled ? { dataSourceId: schema.string() } : {}),
        }),
      },
    },
    policyService.deletePolicy
  );
}
