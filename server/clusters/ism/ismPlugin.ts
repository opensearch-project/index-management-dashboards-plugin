/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { extendClient } from "../extend_client";

/*
    TODO: migrate to types
 * Types are not available until 7.2
 * https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/core/server/opensearch/client/client_config.ts
 * */
export default function ismPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.ism = components.clientAction.namespaceFactory();
  const ism = Client.prototype.ism.prototype;
  extendClient({
    ism,
    ca,
  });
}
