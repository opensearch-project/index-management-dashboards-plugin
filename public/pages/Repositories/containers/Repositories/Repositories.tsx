/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiInMemoryTable,
  EuiPopover,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTextColor,
} from "@elastic/eui";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { getErrorMessage } from "../../../../utils/helpers";
import { CatRepository, CreateRepositoryBody, CreateRepositorySettings } from "../../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService } from "../../../../services";
import { ContentPanel } from "../../../../components/ContentPanel";
import CreateRepositoryFlyout from "../../components/CreateRepositoryFlyout";
import { BREADCRUMBS } from "../../../../utils/constants";
import DeleteModal from "../../components/DeleteModal";
import { truncateSpan } from "../../../Snapshots/helper";

interface RepositoriesProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface RepositoriesState {
  repositories: CatRepository[];
  loading: boolean;
  selectedItems: CatRepository[];

  showFlyout: boolean;

  isPopoverOpen: boolean;

  editRepo: string | null;

  isDeleteModalVisible: boolean;
}

export default class Repositories extends Component<RepositoriesProps, RepositoriesState> {
  static contextType = CoreServicesContext;
  columns: Array<EuiTableFieldDataColumnType<CatRepository>>;

  constructor(props: RepositoriesProps) {
    super(props);

    this.state = {
      repositories: [],
      loading: false,
      selectedItems: [],
      showFlyout: false,
      isPopoverOpen: false,
      editRepo: null,
      isDeleteModalVisible: false,
    };

    this.columns = [
      {
        field: "id",
        name: "Repository name",
        sortable: true,
        dataType: "string",
        width: "15%",
        align: "left",
        render: (value: string, item: CatRepository) => {
          return truncateSpan(value, 30);
        },
      },
      {
        field: "type",
        name: "Type",
        sortable: true,
        dataType: "string",
        width: "10%",
      },
      {
        field: "snapshotCount",
        name: "Snapshot count",
        sortable: true,
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
      const response = await snapshotManagementService.catRepositories();
      if (response.ok) {
        this.setState({ loading: false });
        this.setState({ repositories: response.response });
      } else {
        this.setState({ loading: false });
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.setState({ loading: false });
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the repositories."));
    }
  };

  createRepo = async (repoName: string, repoType: string, settings: CreateRepositorySettings) => {
    try {
      const { snapshotManagementService } = this.props;

      const createRepoBody: CreateRepositoryBody = {
        type: repoType,
        settings,
      };
      const response = await snapshotManagementService.createRepository(repoName, createRepoBody);
      if (response.ok) {
        this.setState({ showFlyout: false });
        let toastMsgPre = "Created";
        if (!!this.state.editRepo) {
          toastMsgPre = "Edited";
        }
        this.context.notifications.toasts.addSuccess(`${toastMsgPre} repository ${repoName}.`);
        await this.getRepos();
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem creating the repository."));
    }
  };

  deleteRepo = async (repoName: string) => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.deleteRepository(repoName);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Deleted repository ${repoName}.`);
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem deleting the repository."));
    }
  };

  onClickDelete = async () => {
    const { selectedItems } = this.state;
    for (const item of selectedItems) {
      const repoName = item.id;
      await this.deleteRepo(repoName);
    }
    await this.getRepos();
  };

  onClickCreate = () => {
    this.setState({ showFlyout: true, editRepo: null });
  };

  onClickEdit = () => {
    const {
      selectedItems: [{ id }],
    } = this.state;
    this.setState({ showFlyout: true, editRepo: id });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  render() {
    const { repositories, loading, selectedItems, showFlyout, isPopoverOpen, editRepo, isDeleteModalVisible } = this.state;

    const popoverActionItems = [
      <EuiContextMenuItem
        key="Edit"
        icon="empty"
        disabled={selectedItems.length !== 1}
        data-test-subj="editButton"
        onClick={() => {
          this.closePopover();
          this.onClickEdit();
        }}
      >
        Edit
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="Delete"
        icon="empty"
        disabled={!selectedItems.length}
        data-test-subj="deleteButton"
        onClick={() => {
          this.closePopover();
          this.showDeleteModal();
        }}
      >
        <EuiTextColor color="danger">Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];
    const popoverButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={() => {
          this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
        }}
        data-test-subj="actionButton"
      >
        Actions
      </EuiButton>
    );
    const actions = [
      <EuiButton iconType="refresh" onClick={this.getRepos} data-test-subj="refreshButton">
        Refresh
      </EuiButton>,
      <EuiButton disabled={!selectedItems.length} onClick={this.showDeleteModal} data-test-subj="deleteButton" color="danger">
        Delete
      </EuiButton>,
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Create repository
      </EuiButton>,
    ];

    const search = {
      box: {
        placeholder: "Search repository",
      },
      filters: [
        {
          type: "field_value_selection",
          field: "type",
          name: "Type",
          options: repositories.map((repo) => ({ value: repo.type })),
          multiSelect: "or",
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>Repositories are remote storage locations used to store snapshots.</p>
      </EuiText>
    );

    let additionalWarning = `You have ${this.getSelectedSnapshotCounts()} snapshots`;
    if (selectedItems.length > 1) {
      additionalWarning += " in these repositories respectively.";
    } else {
      additionalWarning += " in the repository.";
    }
    return (
      <>
        <ContentPanel title="Repositories" actions={actions} subTitleText={subTitleText}>
          <EuiInMemoryTable
            items={repositories}
            itemId="id"
            columns={this.columns}
            pagination={true}
            isSelectable={true}
            selection={{ onSelectionChange: (selectedItems) => this.setState({ selectedItems }) }}
            search={search}
            loading={loading}
          />
        </ContentPanel>

        {showFlyout && (
          <CreateRepositoryFlyout
            service={this.props.snapshotManagementService}
            editRepo={editRepo}
            createRepo={this.createRepo}
            onCloseFlyout={() => {
              this.setState({ showFlyout: false });
            }}
          />
        )}

        {isDeleteModalVisible && (
          <DeleteModal
            type="repository"
            ids={this.getSelectedIds()}
            closeDeleteModal={this.closeDeleteModal}
            onClickDelete={this.onClickDelete}
            confirmation={true}
            addtionalWarning={additionalWarning}
          />
        )}
      </>
    );
  }

  showDeleteModal = () => {
    this.setState({ isDeleteModalVisible: true });
  };
  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  getSelectedIds = () => {
    return this.state.selectedItems
      .map((item: CatRepository) => {
        return item.id;
      })
      .join(", ");
  };

  getSelectedSnapshotCounts = () => {
    return this.state.selectedItems
      .map((item: CatRepository) => {
        return item.snapshotCount;
      })
      .join(", ");
  };
}
