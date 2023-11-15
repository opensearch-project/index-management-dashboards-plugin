/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter) {
  const { commonService } = services;
  const payload = {
    path: NODE_API.API_CALLER,
    validate: {
      body: schema.nullable(
        schema.object({
          endpoint: schema.string(),
          data: schema.nullable(schema.any()),
          hideLog: schema.nullable(schema.boolean()),
        })
      ),
      query: schema.any(),
    },
  };

  router.post(payload, commonService.apiCaller);
}
