/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";
import { schema } from "@osd/config-schema";

export default function (services: NodeServices, router: IRouter) {
  const { notificationService } = services;

  router.get(
    {
      path: NODE_API.CHANNELS,
      validate: false,
    },
    notificationService.getChannels
  );

  router.get(
    {
      path: `${NODE_API.CHANNELS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    notificationService.getChannelById
  );
}
