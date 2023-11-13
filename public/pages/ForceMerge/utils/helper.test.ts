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

import { parseIndexNames } from "./helper";

test("parse index names", () => {
  expect(parseIndexNames("")).toEqual([]);
  expect(parseIndexNames("test-index")).toEqual(["test-index"]);
  expect(parseIndexNames("test-index,test-index-2")).toEqual(["test-index", "test-index-2"]);
  expect(parseIndexNames("test-index,.ds-redis-logs-000001")).toEqual(["test-index", "redis-logs"]);
  expect(parseIndexNames(".ds-redis-logs-000001,.ds-redis-logs-000001")).toEqual(["redis-logs", "redis-logs"]);
  expect(parseIndexNames(".ds-nginx-logs-000001,.ds-redis-logs-000001")).toEqual(["nginx-logs", "redis-logs"]);
  expect(parseIndexNames(".ds-abc-001")).toEqual([".ds-abc-001"]);
});
