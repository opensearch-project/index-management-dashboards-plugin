/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiSearchBar } from "@elastic/eui";

interface SearchControlsProps {
  search: string;
  onSearchChange: (args: any) => void;
}

export default class SearchControls extends Component<SearchControlsProps, {}> {
  render() {
    const { search, onSearchChange } = this.props;

    const schema = {
      strict: true,
      fields: {
        indices: {
          type: "string",
        },
      },
    };

    return (
      <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
        <EuiFlexItem>
          <EuiSearchBar query={search} onChange={onSearchChange} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
