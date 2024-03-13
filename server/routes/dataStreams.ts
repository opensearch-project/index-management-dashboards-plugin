/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean = false) {
  const { dataStreamService } = services;

  let getDataStreamsQuerySchema: any = {
    search: schema.maybe(schema.string()),
  };
  if (dataSourceEnabled) {
    getDataStreamsQuerySchema = {
      ...getDataStreamsQuerySchema,
      dataSourceId: schema.string(),
    };
  }

  router.get(
    {
      path: NODE_API._DATA_STREAMS,
      validate: {
        query: schema.object(getDataStreamsQuerySchema),
      },
    },
    dataStreamService.getDataStreams
  );
}
