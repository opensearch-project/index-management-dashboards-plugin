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
      addDanger: jest.fn(() => ({})).mockName("addDanger"),
      addSuccess: jest.fn(() => ({})).mockName("addSuccess"),
    },
  },
  docLinks: {
    links: {
      opensearch: {
        reindexData: {
          base: "https://opensearch.org/docs/latest/opensearch/reindex-data/",
        },
        queryDSL: {
          base: "https://opensearch.org/docs/opensearch/query-dsl/index/",
        },
      },
    },
  },
};

export default (coreServicesMock as unknown) as CoreStart;
