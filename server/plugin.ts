/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { Plugin, CoreSetup, CoreStart, Logger, PluginInitializerContext } from "../../../src/core/server";
import ismPlugin from "./clusters/ism/ismPlugin";
import {
  PolicyService,
  ManagedIndexService,
  IndexService,
  RollupService,
  TransformService,
  DataStreamService,
  NotificationService,
  SnapshotManagementService,
  CommonService,
  AliasServices,
} from "./services";
import {
  indices,
  policies,
  managedIndices,
  rollups,
  transforms,
  notifications,
  snapshotManagement,
  common,
  aliases,
} from "../server/routes";
import dataStreams from "./routes/dataStreams";
import { NodeServices } from "./models/interfaces";
import { getClientSupportMDS } from "./client";
import { OpenSearchDashboardsClient } from "@opensearch-project/opensearch/api/opensearch_dashboards";
import { Client } from "elasticsearch";

export class IndexPatternManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  private readonly logger: Logger;
  constructor(private initializerContext: PluginInitializerContext<{}>) {
    this.logger = this.initializerContext.logger.get();
  }
  public async setup(core: CoreSetup) {
    // create OpenSearch client that aware of ISM API endpoints
    const legacyClient = core.opensearch.legacy.createClient("index_management", {
      plugins: [ismPlugin],
    });

    const osDriverSupportMDS = getClientSupportMDS({
      core,
      client: legacyClient,
      onExtendClient(client) {
        const finalClinet = (client as unknown) as OpenSearchDashboardsClient & { ism?: any };
        if (finalClinet.ism) {
          return {};
        }

        return {
          ism: ((legacyClient as unknown) as { client: Client & { ism: any } }).client.ism,
        };
      },
      pluginId: "opensearch_index_management_dashboards",
      logger: this.logger,
    });

    // Initialize services
    const indexService = new IndexService(osDriverSupportMDS);
    const dataStreamService = new DataStreamService(osDriverSupportMDS);
    const policyService = new PolicyService(osDriverSupportMDS);
    const managedIndexService = new ManagedIndexService(osDriverSupportMDS);
    const rollupService = new RollupService(osDriverSupportMDS);
    const transformService = new TransformService(osDriverSupportMDS);
    const notificationService = new NotificationService(osDriverSupportMDS);
    const snapshotManagementService = new SnapshotManagementService(osDriverSupportMDS);
    const commonService = new CommonService(osDriverSupportMDS);
    const aliasService = new AliasServices(osDriverSupportMDS);
    const services: NodeServices = {
      indexService,
      dataStreamService,
      policyService,
      managedIndexService,
      rollupService,
      transformService,
      notificationService,
      snapshotManagementService,
      commonService,
      aliasService,
    };

    // create router
    const router = core.http.createRouter();
    // Add server routes
    indices(services, router);
    dataStreams(services, router);
    policies(services, router);
    managedIndices(services, router);
    rollups(services, router);
    transforms(services, router);
    notifications(services, router);
    snapshotManagement(services, router);
    common(services, router);
    aliases(services, router);

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
