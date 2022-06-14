/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSearchBar, EuiFlexGroup, EuiFlexItem, Query } from "@elastic/eui";
import { OnSearchChangeArgs } from "../models/interfaces";
import React, { Component } from "react";

interface SnapshotControlsProp {
  search: string;
  onSearchChange: (params: OnSearchChangeArgs) => void;
}

export function SnapshotControls({ search, onSearchChange }: SnapshotControlsProp) {
  const schema = {
    strict: true,
    fields: {
      indices: {
        type: "string",
      },
      data_streams: {
        type: "string",
      },
    },
  };

  // const filters = showDataStreams
  //     ? [
  //         {
  //           type: "field_value_selection",
  //           field: "data_streams",
  //           name: "Data streams",
  //           noOptionsMessage: "No data streams found",
  //           multiSelect: "or",
  //           cache: 60000,
  //           options: () => this.getDataStreams(),
  //         },
  //       ]
  //     : undefined;

  return (
    <EuiFlexGroup style={{ padding: "0px 5px" }}>
      <EuiFlexItem>
        <EuiSearchBar
          query={search}
          box={{ placeholder: "Search", schema, incremental: true }}
          onChange={onSearchChange}
          // filters={filters}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
