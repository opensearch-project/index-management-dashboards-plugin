/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Legacy } from "opensearch-dashboards";
import ismPlugin from "./ismPlugin";
import { CLUSTER, DEFAULT_HEADERS } from "../../utils/constants";

type Server = Legacy.Server;

export default function createISMCluster(server: Server) {
  const { customHeaders, ...rest } = server.config().get("opensearch");
  server.plugins.opensearch.createCluster(CLUSTER.ISM, {
    plugins: [ismPlugin],
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
