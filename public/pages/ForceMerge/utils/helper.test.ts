/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { checkDuplicate, parseIndexNames } from "./helper";
import { IndexSelectItem } from "../models/interfaces";
import { EuiComboBoxOptionOption } from "@elastic/eui";

test("parse index names", () => {
  expect(parseIndexNames("")).toEqual([]);
  expect(parseIndexNames("test-index")).toEqual(["test-index"]);
  expect(parseIndexNames("test-index,test-index-2")).toEqual(["test-index", "test-index-2"]);
  expect(parseIndexNames("test-index,.ds-redis-logs-000001")).toEqual(["test-index", "redis-logs"]);
  expect(parseIndexNames(".ds-redis-logs-000001,.ds-redis-logs-000001")).toEqual(["redis-logs", "redis-logs"]);
  expect(parseIndexNames(".ds-nginx-logs-000001,.ds-redis-logs-000001")).toEqual(["nginx-logs", "redis-logs"]);
  expect(parseIndexNames(".ds-abc-001")).toEqual([".ds-abc-001"]);
});

test("test check duplication for source and destination", () => {
  const source = [{ label: "s1", value: { isIndex: true } }];
  const dest = [{ label: "d1", value: { isIndex: true } }];
  expect(checkDuplicate(source, dest)).toEqual(null);
});

test("test check duplication has duplication", () => {
  const source = [{ label: "s1", value: { isIndex: true } }];
  const dest = [{ label: "s1", value: { isIndex: true } }];
  expect(checkDuplicate(source, dest)).toEqual(`Index [s1] both exists in source and destination`);
});

test("test check duplication for alias", () => {
  let source: EuiComboBoxOptionOption<IndexSelectItem>[] = [{ label: "s1", value: { isIndex: true } }];
  let dest: EuiComboBoxOptionOption<IndexSelectItem>[] = [
    {
      label: "a1",
      value: { isAlias: true, writingIndex: "s2" },
    },
  ];
  expect(checkDuplicate(source, dest)).toEqual(null);

  dest = [{ label: "a1", value: { isAlias: true, writingIndex: "s1" } }];
  expect(checkDuplicate(source, dest)).toEqual(`Index [s1] both exists in source and destination`);

  source = [{ label: "a1", value: { isAlias: true, writingIndex: "s2", indices: ["s2"] } }];
  dest = [{ label: "a1", value: { isAlias: true, writingIndex: "s2", indices: ["s2"] } }];
  expect(checkDuplicate(source, dest)).toEqual(`Index [a1,s2] both exists in source and destination`);

  source = [{ label: "a1", value: { isAlias: true, indices: ["s1", "s2"] } }];
  dest = [{ label: "s2", value: { isIndex: true } }];
  expect(checkDuplicate(source, dest)).toEqual(`Index [s2] both exists in source and destination`);
});

test("test check duplication for data streams", () => {
  const source = [{ label: ".ds-test-0000001", value: { isIndex: true } }];
  const dest = [
    {
      label: "test",
      value: { isDataStream: true, indices: [".ds-test-0000002", ".ds-test-0000001"], writingIndex: ".ds-test-0000002" },
    },
  ];
  expect(checkDuplicate(source, dest)).toEqual(null);
});
