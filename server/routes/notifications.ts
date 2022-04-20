/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter) {
  const { notificationService } = services;

  router.get(
    {
      path: NODE_API.CHANNELS,
      validate: false,
    },
    notificationService.getChannels
  );
}
