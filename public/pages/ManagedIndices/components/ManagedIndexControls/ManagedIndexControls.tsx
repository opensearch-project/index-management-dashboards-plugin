/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  ArgsWithQuery,
  ArgsWithError,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
  EuiSearchBar,
  EuiSwitch,
  EuiButton,
  EuiPopover,
  EuiContextMenuPanel,
} from "@elastic/eui";
import { DataStream } from "../../../../../server/models/interfaces";
import { ManagedIndices } from "../../containers/ManagedIndices/ManagedIndices";
import { ManagedIndexItem } from "plugins/index-management-dashboards-plugin/models/interfaces";

interface ManagedIndexControlsProps {
  search: string;
  showDataStreams: boolean;
  onSearchChange: (args: ArgsWithQuery | ArgsWithError) => void;
  onRefresh: () => void;
  getDataStreams: () => Promise<DataStream[]>;
  toggleShowDataStreams: () => void;
  selectedItems: ManagedIndexItem[];
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

  onActionButtonClick = () => {
    this.setState({ isPopOverOpen: !this.state.isPopOverOpen });
  };

  render() {
    const { search, onSearchChange, showDataStreams, toggleShowDataStreams, selectedItems } = this.props;

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

    const actionButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
      >
        Actions
      </EuiButton>
    );

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
          <EuiButton iconType="refresh" data-test-subj="refreshButton" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover id="action" button={actionButton} panelPaddingSize="none" anchorPosition="downLeft" data-test-subj="actionPopover">
            <EuiContextMenuPanel />
          </EuiPopover>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            label="Show data stream indexes"
            checked={showDataStreams}
            onChange={toggleShowDataStreams}
            data-test-subj="toggleShowDataStreams"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
