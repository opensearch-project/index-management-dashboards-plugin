/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPagination } from "@elastic/eui";
import EuiRefreshPicker from "../../../../temporary/EuiRefreshPicker";

interface PolicyControlsProps {
  activePage: number;
  pageCount: number;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageClick: (page: number) => void;
  onRefresh: () => Promise<void>;
}

interface PolicyControlsState {
  refreshInterval: number;
  isPaused: boolean;
}

export default class PolicyControls extends Component<PolicyControlsProps, PolicyControlsState> {
  state: PolicyControlsState = {
    refreshInterval: 0,
    isPaused: true,
  };

  onRefreshChange = ({ refreshInterval, isPaused }: PolicyControlsState): void => {
    this.setState({ isPaused, refreshInterval });
  };

  render() {
    const { activePage, pageCount, search, onSearchChange, onPageClick, onRefresh } = this.props;
    const { refreshInterval, isPaused } = this.state;
    return (
      <EuiFlexGroup style={{ padding: "0px 5px" }}>
        <EuiFlexItem>
          <EuiFieldSearch fullWidth={true} value={search} placeholder="Search" onChange={onSearchChange} />
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ maxWidth: 250 }}>
          <EuiRefreshPicker
            isPaused={isPaused}
            refreshInterval={refreshInterval}
            onRefreshChange={this.onRefreshChange}
            onRefresh={onRefresh}
          />
        </EuiFlexItem>
        {pageCount > 1 && (
          <EuiFlexItem grow={false} style={{ justifyContent: "center" }}>
            <EuiPagination
              pageCount={pageCount}
              activePage={activePage}
              onPageClick={onPageClick}
              data-test-subj="policyControlsPagination"
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    );
  }
}
