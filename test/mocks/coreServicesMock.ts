/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
      addWarning: jest.fn(() => ({})).mockName("addWarning"),
      remove: jest.fn(() => ({})).mockName("remove"),
    },
  },
  docLinks: {
    links: {
      opensearch: {
        reindexData: {
          base: "https://opensearch.org/docs/latest/opensearch/reindex-data/",
          transform: "https://opensearch.org/docs/latest/opensearch/reindex-data/#transform-documents-during-reindexing",
        },
        queryDSL: {
          base: "https://opensearch.org/docs/opensearch/query-dsl/index/",
        },
        indexTemplates: {
          base: "https://opensearch.org/docs/latest/opensearch/index-templates",
        },
        indexAlias: {
          base: "https://opensearch.org/docs/latest/opensearch/index-alias/",
        },
      },
    },
  },
};

export default (coreServicesMock as unknown) as CoreStart;
