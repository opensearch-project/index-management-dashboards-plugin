/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { Plugin, CoreSetup, CoreStart, ILegacyCustomClusterClient } from "../../../src/core/server";
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

export class IndexPatternManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  public async setup(core: CoreSetup) {
    // create OpenSearch client that aware of ISM API endpoints
    const osDriver: ILegacyCustomClusterClient = core.opensearch.legacy.createClient("index_management", {
      plugins: [ismPlugin],
    });

    const osDriverSupportMDS = getClientSupportMDS({
      core,
      client: core.opensearch.legacy.createClient("index_management", {
        plugins: [ismPlugin],
      }),
      pluginId: "opensearch_index_management_dashboards",
    });

    // Initialize services
    const indexService = new IndexService(osDriver);
    const dataStreamService = new DataStreamService(osDriver);
    const policyService = new PolicyService(osDriver);
    const managedIndexService = new ManagedIndexService(osDriver);
    const rollupService = new RollupService(osDriver);
    const transformService = new TransformService(osDriver);
    const notificationService = new NotificationService(osDriver);
    const snapshotManagementService = new SnapshotManagementService(osDriver);
    const commonService = new CommonService(osDriverSupportMDS);
    const aliasService = new AliasServices(osDriver);
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
