/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { ArgsWithError, ArgsWithQuery, EuiButton, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSearchBar, EuiSwitch } from "@elastic/eui";
import { DataStream, ManagedCatIndex } from "../../../../../server/models/interfaces";
import IndicesActions from "../../containers/IndicesActions";
import { getUISettings } from "../../../../services/Services";

interface IndexControlsProps {
  search: string;
  showDataStreams: boolean;
  onSearchChange: (args: ArgsWithQuery | ArgsWithError) => void;
  onRefresh: () => Promise<void>;
  getDataStreams: () => Promise<DataStream[]>;
  toggleShowDataStreams: () => void;
  selectedItems: ManagedCatIndex[];
}

interface IndexControlsState {
  refreshInterval: number;
  isPaused: boolean;
}

export default class IndexControls extends Component<IndexControlsProps, IndexControlsState> {
  state: IndexControlsState = {
    refreshInterval: 0,
    isPaused: true,
  };

  onRefreshChange = ({ refreshInterval, isPaused }: IndexControlsState): void => {
    this.setState({ isPaused, refreshInterval });
  };

  getDataStreams = async () => {
    return (await this.props.getDataStreams()).map((ds) => ({ value: ds.name }));
  };

  render() {
    const { search, onSearchChange, showDataStreams, toggleShowDataStreams, onRefresh, selectedItems } = this.props;

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
            multiSelect: "or",
            cache: 60000,
            options: () => this.getDataStreams(),
          },
        ]
      : undefined;

    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");

    return useUpdatedUX ? (
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
          <EuiButtonIcon iconType="refresh" data-test-subj="refreshButton" display="base" size="m" />
        </EuiFlexItem>
        <IndicesActions
          {...this.props}
          onDelete={onRefresh}
          onClose={onRefresh}
          onShrink={onRefresh}
          selectedItems={selectedItems}
          getIndices={onRefresh}
        />
        <EuiFlexItem grow={false}>
          <EuiSwitch
            label="Show data stream indexes"
            checked={showDataStreams}
            onChange={toggleShowDataStreams}
            data-testE-subj="toggleShowDataStreams"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    ) : (
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
            label="Show data stream indexes"
            checked={showDataStreams}
            onChange={toggleShowDataStreams}
            data-testE-subj="toggleShowDataStreams"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
