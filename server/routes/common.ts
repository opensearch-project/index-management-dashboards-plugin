/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { NODE_API } from "../../utils/constants";
import { IRouter } from "../../../../src/core/server";

export default function (services: NodeServices, router: IRouter, dataSourceEnabled: boolean = false) {
  const { commonService } = services;
  let query = schema.object({}, { unknowns: "allow" });

  if (dataSourceEnabled) {
    query = query.extends({
      dataSourceId: schema.string(),
    });
  }
  let bodySchema = schema.nullable(
    schema.object({
      endpoint: schema.string(),
      data: schema.nullable(schema.any()),
      hideLog: schema.nullable(schema.boolean()),
    })
  );

  const payload = {
    path: NODE_API.API_CALLER,
    validate: {
      body: bodySchema,
      query: query,
    },
  };

  router.post(payload, commonService.apiCaller);

  // this api is called on the very first page load
  router.post(
    {
      path: NODE_API.ACCOUNT_INFO,
      validate: {
        body: bodySchema,
      },
    },
    commonService.apiCaller
  );
}
