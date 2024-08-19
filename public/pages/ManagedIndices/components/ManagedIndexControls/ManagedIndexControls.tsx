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
  EuiButtonIcon,
  EuiButtonEmpty,
} from "@elastic/eui";
import { DataStream } from "../../../../../server/models/interfaces";
import { ManagedIndices } from "../../containers/ManagedIndices/ManagedIndices";
import { ManagedIndexItem } from "plugins/index-management-dashboards-plugin/models/interfaces";
import { getUISettings } from "../../../../services/Services";
import { size } from "lodash";

interface ManagedIndexControlsProps {
  search: string;
  showDataStreams: boolean;
  onSearchChange: (args: ArgsWithQuery | ArgsWithError) => void;
  onRefresh: () => void;
  getDataStreams: () => Promise<DataStream[]>;
  toggleShowDataStreams: () => void;
  Actions?: React.JSX.Element;
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
    const { search, onSearchChange, showDataStreams, toggleShowDataStreams, Actions } = this.props;

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
            popoverProps: {
              button: (
                <EuiButtonEmpty size="s" iconType="arrowDown" iconSide="right" flush="right">
                  Data streams2
                </EuiButtonEmpty>
              ),
            },
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
            box={{ placeholder: "Search", schema, incremental: true, compressed: true }}
            onChange={onSearchChange}
            filters={filters}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon iconType="refresh" data-test-subj="refreshButton" display="base" size="s" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{Actions}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSwitch
            compressed
            label="Show data stream indexes"
            checked={showDataStreams}
            onChange={toggleShowDataStreams}
            data-test-subj="toggleShowDataStreams"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    ) : (
      <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
        <EuiFlexItem>
          <EuiSearchBar
            query={search}
            box={{ placeholder: "Search index name", schema, incremental: true }}
            onChange={onSearchChange}
            filters={filters}
          />
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
