/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { ArgsWithQuery, ArgsWithError, EuiFlexGroup, EuiFlexItem, EuiPagination, EuiSearchBar, EuiSwitch } from "@elastic/eui";
import EuiRefreshPicker from "../../../../temporary/EuiRefreshPicker";
import { DataStream } from "../../../../../server/models/interfaces";

interface ManagedIndexControlsProps {
  search: string;
  showDataStreams: boolean;
  onSearchChange: (args: ArgsWithQuery | ArgsWithError) => void;
  onRefresh: () => void;
  getDataStreams: () => Promise<DataStream[]>;
  toggleShowDataStreams: () => void;
}

export default class ManagedIndexControls extends Component<ManagedIndexControlsProps, object> {
  state = {
    refreshInterval: 0,
    isPaused: true,
  };

  onRefreshChange = ({ refreshInterval, isPaused }: { refreshInterval: number; isPaused: boolean }) => {
    this.setState({ isPaused, refreshInterval });
  };

  getDataStreams = async () => {
    return (await this.props.getDataStreams()).map((ds) => ({ value: ds.name }));
  };

  render() {
    const { search, onSearchChange, onRefresh, showDataStreams, toggleShowDataStreams } = this.props;
    const { refreshInterval, isPaused } = this.state;

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

    const filters = showDataStreams
      ? [
          {
            type: "field_value_selection",
            field: "data_streams",
            name: "Data streams",
            noOptionsMessage: "No data streams found",
            multiSelect: false,
            cache: 60000,
            options: () => this.getDataStreams(),
          },
        ]
      : undefined;

    return (
      <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
        <EuiFlexItem>
          <EuiSearchBar
            query={search}
            box={{ placeholder: "Search", schema, incremental: true }}
            onChange={onSearchChange}
            filters={filters}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            label="Show data stream indices"
            checked={showDataStreams}
            onChange={toggleShowDataStreams}
            data-test-subj="toggleShowDataStreams"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: 250 }}>
          <EuiRefreshPicker
            isPaused={isPaused}
            refreshInterval={refreshInterval}
            onRefreshChange={this.onRefreshChange}
            onRefresh={onRefresh}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
