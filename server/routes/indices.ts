/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter) {
  const { indexService } = services;

  router.post(
    {
      path: NODE_API._SEARCH,
      validate: {
        body: schema.any(),
      },
    },
    indexService.search
  );

  router.get(
    {
      path: NODE_API._INDICES,
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
        }),
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
