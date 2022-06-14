/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiButton, EuiInMemoryTable, EuiTableFieldDataColumnType } from "@elastic/eui";
import { getErrorMessage } from "../../../utils/helpers";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CatRepository } from "../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../components/core_services";
import { SnapshotManagementService } from "../../../services";
import { BREADCRUMBS } from "../../../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";

interface RepositoriesProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface RepositoriesState {
  repositories: CatRepository[];
  loading: boolean;
  selectedItems: CatRepository[];
}

export default class Repositories extends Component<RepositoriesProps, RepositoriesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<CatRepository>[];

  constructor(props: RepositoriesProps) {
    super(props);

    this.state = {
      repositories: [],
      loading: false,
      selectedItems: [],
    };

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
        dataType: "string",
        width: "20%",
        align: "center",
      },
      {
        field: "type",
        name: "Type",
        sortable: true,
        dataType: "string",
        width: "80%",
      },
    ];
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.REPOSITORIES]);
    await this.getRepos();
  }

  getRepos = async () => {
    this.setState({ loading: true });

    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getRepositories();
      if (response.ok) {
        this.setState({ repositories: response.response });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    } finally {
      this.setState({ loading: false });
    }
  };

  onSelectionChange = (selectedItems: CatRepository[]): void => {
    this.setState({ selectedItems });
  };

  render() {
    const { repositories, loading } = this.state;

    return (
      <ContentPanel
        title="Repositories"
        actions={
          <EuiButton iconType="refresh" onClick={this.getRepos} data-test-subj="refreshButton">
            Refresh
          </EuiButton>
        }
      >
        <EuiInMemoryTable
          items={repositories}
          itemId="id"
          columns={this.columns}
          isSelectable={true}
          selection={{ onSelectionChange: this.onSelectionChange }}
          loading={loading}
        />
      </ContentPanel>
    );
  }
}
