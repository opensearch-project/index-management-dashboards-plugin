/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from "opensearch-dashboards/public";

const coreServicesMock = {
  uiSettings: {
    get: jest.fn(),
  },
  chrome: {
    setBreadcrumbs: jest.fn(),
  },
  notifications: {
    toasts: {
      addDanger: jest.fn().mockName("addDanger"),
      addSuccess: jest.fn().mockName("addSuccess"),
    },
  },
};

export default (coreServicesMock as unknown) as CoreStart;
