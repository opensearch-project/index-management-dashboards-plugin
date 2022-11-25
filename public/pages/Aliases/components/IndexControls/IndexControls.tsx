/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiSearchBar, EuiSelect } from "@elastic/eui";
import { ALIAS_STATUS_OPTIONS } from "../../../../utils/constants";

export interface SearchControlsProps {
  value: {
    search: string;
    status: string;
  };
  onSearchChange: (args: SearchControlsProps["value"]) => void;
}

export default class SearchControls extends Component<SearchControlsProps, SearchControlsProps["value"]> {
  state = this.props.value;
  onSearchChange = () => {
    this.props.onSearchChange(this.state);
  };
  onChange = <T extends keyof SearchControlsProps["value"]>(field: T, value: SearchControlsProps["value"][T]) => {
    this.setState(
      {
        [field]: value,
      } as SearchControlsProps["value"],
      () => {
        this.onSearchChange();
      }
    );
  };
  render() {
    return (
      <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
        <EuiFlexItem>
          <EuiSearchBar
            query={this.state.search}
            onChange={({ queryText }) => {
              this.onChange("search", queryText);
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect value={this.state.status} options={ALIAS_STATUS_OPTIONS} onChange={(e) => this.onChange("status", e.target.value)} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
