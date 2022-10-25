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
} from "./services";
import { indices, policies, managedIndices, rollups, transforms, notifications, snapshotManagement, common } from "../server/routes";
import dataStreams from "./routes/dataStreams";

export class IndexPatternManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  public async setup(core: CoreSetup) {
    // create OpenSearch client that aware of ISM API endpoints
    const osDriver: ILegacyCustomClusterClient = core.opensearch.legacy.createClient("index_management", {
      plugins: [ismPlugin],
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
    const commonService = new CommonService(osDriver);
    const services = {
      indexService,
      dataStreamService,
      policyService,
      managedIndexService,
      rollupService,
      transformService,
      notificationService,
      snapshotManagementService,
      commonService,
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

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
