/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiTitle } from "@elastic/eui";
import { CoreServicesContext } from "../../components/core_services";
import { BREADCRUMBS } from "../../utils/constants";

interface SnapshotsProps extends RouteComponentProps {}

interface SnapshotsState {}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;

  async componentDidMount(): Promise<void> {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS]);
  }

  render() {
    return (
      <div>
        <EuiTitle size="l">
          <h1>Snapshots</h1>
        </EuiTitle>
      </div>
    );
  }
}
