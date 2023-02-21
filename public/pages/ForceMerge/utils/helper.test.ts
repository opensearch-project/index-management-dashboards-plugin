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
