/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
