/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DATA_STREAM_REGEX } from "./constants";
import { IndexSelectItem } from "../models/interfaces";
import { EuiComboBoxOptionOption } from "@elastic/eui";
import _ from "lodash";

export const parseIndexNames = (indices: string): string[] => {
  let indexArray: string[] = [];
  indices &&
    indices.split(",").forEach((index) => {
      // need extract data stream name first
      if (DATA_STREAM_REGEX.test(index)) {
        let match = index.match(DATA_STREAM_REGEX);
        indexArray.push(match ? match[1] : index);
      } else {
        indexArray.push(index);
      }
    });
  return indexArray;
};

export const checkDuplicate = (
  sources: EuiComboBoxOptionOption<IndexSelectItem>[],
  destination: EuiComboBoxOptionOption<IndexSelectItem>[]
) => {
  let expandedSource: string[] = [],
    expandedDestination: string[] = [];
  sources.forEach((item) => {
    expandedSource.push(item.label);
    item.value?.isAlias && item.value.indices && expandedSource.push(...item.value.indices);
    item.value?.isDataStream && item.value.indices && expandedSource.push(...item.value.indices);
  });

  destination.forEach((item) => {
    expandedDestination.push(item.label);
    item.value?.isAlias && item.value.writingIndex && expandedDestination.push(item.value.writingIndex);
    item.value?.isDataStream && item.value.writingIndex && expandedDestination.push(item.value.writingIndex);
  });

  const duplicate = _.intersection(expandedSource, expandedDestination);
  if (duplicate.length > 0) {
    return `Index [${duplicate.join(",")}] both exists in source and destination`;
  }
  return null;
};
