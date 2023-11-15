/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IndexService,
  ManagedIndexService,
  PolicyService,
  RollupService,
  TransformService,
  NotificationService,
  CommonService,
  SnapshotManagementService,
} from "../../public/services";
import httpClientMock from "./httpClientMock";

const indexService = new IndexService(httpClientMock);
const managedIndexService = new ManagedIndexService(httpClientMock);
const policyService = new PolicyService(httpClientMock);
const rollupService = new RollupService(httpClientMock);
const transformService = new TransformService(httpClientMock);
const notificationService = new NotificationService(httpClientMock);
const snapshotManagementService = new SnapshotManagementService(httpClientMock);
const commonService = new CommonService(httpClientMock);

export default {
  indexService,
  managedIndexService,
  policyService,
  rollupService,
  transformService,
  notificationService,
  snapshotManagementService,
  commonService,
};
