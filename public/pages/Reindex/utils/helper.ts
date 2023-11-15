/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from "@elastic/eui";
import _ from "lodash";
import { DATA_STREAM_REGEX } from "./constants";
import { IndexSelectItem } from "../models/interfaces";

/**
 * parse index names to extract data stream name if the index is a backing index of data stream,
 * otherwise using whatever it is
 *
 * the reason for this is that GET _cat/indices/*.ds* will not return any result, it will need data stream name
 * to pull all data stream indices
 * @param indices
 */
export const parseIndexNames = (indices: string): string[] => {
  const indexArray: string[] = [];
  if (indices)
    indices.split(",").forEach((index) => {
      // need extract data stream name first
      if (DATA_STREAM_REGEX.test(index)) {
        const match = index.match(DATA_STREAM_REGEX);
        indexArray.push(match ? match[1] : index);
      } else {
        indexArray.push(index);
      }
    });
  return indexArray;
};

export const checkDuplicate = (
  sources: Array<EuiComboBoxOptionOption<IndexSelectItem>>,
  destination: Array<EuiComboBoxOptionOption<IndexSelectItem>>
) => {
  const expandedSource: string[] = [];
  const expandedDestination: string[] = [];
  sources.forEach((item) => {
    expandedSource.push(item.label);
    if (item.value?.isAlias && item.value.indices) expandedSource.push(...item.value.indices);
    if (item.value?.isDataStream && item.value.indices) expandedSource.push(...item.value.indices);
  });

  destination.forEach((item) => {
    expandedDestination.push(item.label);
    if (item.value?.isAlias && item.value.writingIndex) expandedDestination.push(item.value.writingIndex);
    if (item.value?.isDataStream && item.value.writingIndex) expandedDestination.push(item.value.writingIndex);
  });

  const duplicate = _.intersection(expandedSource, expandedDestination);
  if (duplicate.length > 0) {
    return `Index [${duplicate.join(",")}] both exists in source and destination`;
  }
  return null;
};

export const filterOverlaps = (
  list: Array<EuiComboBoxOptionOption<IndexSelectItem>>,
  excludeList?: Array<EuiComboBoxOptionOption<IndexSelectItem>>
) => {
  if (excludeList) {
    list.map((it) => {
      it.options = it.options?.filter((item) => !checkDuplicate(excludeList, [item]));
    });
  }
  return list;
};
