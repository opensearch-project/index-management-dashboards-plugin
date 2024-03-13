/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean = false) {
  const { indexService } = services;

  let getIndicesQuerySchema: any = {
    from: schema.number(),
    size: schema.number(),
    search: schema.string(),
    sortField: schema.string(),
    sortDirection: schema.string(),
    terms: schema.maybe(schema.any()),
    indices: schema.maybe(schema.any()),
    dataStreams: schema.maybe(schema.any()),
    showDataStreams: schema.boolean(),
    expandWildcards: schema.maybe(schema.string()),
    exactSearch: schema.maybe(schema.string()),
  };
  if (dataSourceEnabled) {
    getIndicesQuerySchema = {
      ...getIndicesQuerySchema,
      dataSourceId: schema.string(),
    };
  }
  router.get(
    {
      path: NODE_API._INDICES,
      validate: {
        query: schema.object(getIndicesQuerySchema),
      },
    },
    indexService.getIndices
  );

  router.post(
    {
      path: NODE_API.APPLY_POLICY,
      validate: {
        body: schema.any(),
      },
    },
    indexService.applyPolicy
  );

  router.post(
    {
      path: NODE_API.EDIT_ROLLOVER_ALIAS,
      validate: {
        body: schema.any(),
      },
    },
    indexService.editRolloverAlias
  );
}
