/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import React, { Component } from "react";

export function SnapshotControls() {
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
    </EuiFlexGroup>
  );
}
