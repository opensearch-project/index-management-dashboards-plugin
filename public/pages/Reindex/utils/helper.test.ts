/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from "@elastic/eui";
import { checkDuplicate, filterOverlaps, parseIndexNames } from "./helper";
import { IndexSelectItem } from "../models/interfaces";

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
  let source: Array<EuiComboBoxOptionOption<IndexSelectItem>> = [{ label: "s1", value: { isIndex: true } }];
  let dest: Array<EuiComboBoxOptionOption<IndexSelectItem>> = [
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

test("test filter overlap for indices", () => {
  let list: Array<EuiComboBoxOptionOption<IndexSelectItem>> = [
    { label: "indices", options: [{ label: "index-1", value: { isIndex: true } }] },
  ];
  let excludedList = [{ label: "index-1", value: { isIndex: true } }] as Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  let result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(0);

  list = [{ label: "indices", options: [{ label: "index-1", value: { isIndex: true } }] }];
  excludedList = [{ label: "index-2", value: { isIndex: true } }] as Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(1);
});

test("test filter overlap for aliases", () => {
  let list: Array<EuiComboBoxOptionOption<IndexSelectItem>> = [
    { label: "aliases", options: [{ label: "alias-1", value: { isAlias: true, indices: ["test-1", "test-2"], writingIndex: "test-1" } }] },
  ];
  let excludedList = [{ label: "test-1", value: { isIndex: true } }] as Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  let result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(0);

  list = [{ label: "aliases", options: [{ label: "alias-1", value: { isAlias: true, indices: ["test-1", "test-2"] } }] }];
  excludedList = [{ label: "test-1", value: { isIndex: true } }] as Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(1);
});

test("test filter overlap for data streams", () => {
  const list: Array<EuiComboBoxOptionOption<IndexSelectItem>> = [
    { label: "data streams", options: [{ label: "ds-1", value: { isDataStream: true, writingIndex: ".ds-ds-1-000001" } }] },
  ];
  let excludedList = [{ label: ".ds-ds-1-000001", value: { isIndex: true } }] as Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  let result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(0);

  excludedList = [{ label: "data streams", options: [{ label: "ds-1", value: { isDataStream: true, writingIndex: ".ds-ds-1-000001" } }] }];
  result = filterOverlaps(list, excludedList);
  expect(result[0].options?.length).toEqual(0);
});
