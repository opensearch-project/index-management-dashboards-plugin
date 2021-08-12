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

/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
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
} from "./services";
import { indices, policies, managedIndices, rollups, transforms, notifications } from "../server/routes";
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
    const services = {
      indexService,
      dataStreamService,
      policyService,
      managedIndexService,
      rollupService,
      transformService,
      notificationService,
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

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
