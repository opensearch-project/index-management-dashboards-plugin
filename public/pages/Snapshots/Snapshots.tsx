/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { EuiBasicTable, EuiTableFieldDataColumnType, EuiTitle } from "@elastic/eui";
import { CoreServicesContext } from "../../components/core_services";
import { BREADCRUMBS } from "../../utils/constants";
import { SnapshotManagementService } from "../../services";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotsState {}

interface SnapshotItem {
  id: string;
  start_time: string;
  end_time: string;
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SnapshotItem>[];

  constructor(props: SnapshotsProps) {
    super(props);

    this.state = {};

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
      },
      {
        field: "start_time",
        name: "Start",
      },
      {
        field: "end_time",
        name: "End",
      },
    ];
  }

  async componentDidMount(): Promise<void> {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS]);
    const { snapshotManagementService } = this.props;
    const response = await snapshotManagementService.getSnapshots();
    console.log(`sm dev Snapshots get response ${JSON.stringify(response)}`);
  }

  render() {
    return (
      <div>
        <EuiTitle size="l">
          <h1>Snapshots</h1>
        </EuiTitle>

        {/* <EuiBasicTable

        /> */}
      </div>
    );
  }
}
