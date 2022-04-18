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
} from "../../public/services";
import httpClientMock from "./httpClientMock";

const indexService = new IndexService(httpClientMock);
const managedIndexService = new ManagedIndexService(httpClientMock);
const policyService = new PolicyService(httpClientMock);
const rollupService = new RollupService(httpClientMock);
const transformService = new TransformService(httpClientMock);
const notificationService = new NotificationService(httpClientMock);

export default {
  indexService,
  managedIndexService,
  policyService,
  rollupService,
  transformService,
  notificationService,
};
