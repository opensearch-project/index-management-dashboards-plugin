/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeServices } from "../models/interfaces";
import { IRouter } from "../../../../src/core/server";
import { NODE_API } from "../../utils/constants";
import { schema } from "@osd/config-schema";

export default function (services: NodeServices, router: IRouter) {
  const { snapshotManagementService } = services;

  router.get(
    {
      path: NODE_API._SNAPSHOTS,
      validate: {
        // for public service to pass object to server service
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          sortField: schema.string(),
          sortDirection: schema.string(),
          // search: schema.string(),
        }),
      },
    },
    snapshotManagementService.catSnapshots
  );
}
