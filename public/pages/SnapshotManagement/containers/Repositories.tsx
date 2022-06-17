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
import { getErrorMessage } from "../../../utils/helpers";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CatRepository, CreateRepositoryBody, CreateRepositorySettings } from "../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../components/core_services";
import { SnapshotManagementService } from "../../../services";
import { BREADCRUMBS } from "../../../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";
import CreateRepositoryFlyout from "../components/CreateRepositoryFlyout";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";

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
      showFlyout: false,
      isPopoverOpen: false,
      editRepo: null,
    };

    this.columns = [
      {
        field: "id",
        name: "Repository name",
        sortable: true,
        dataType: "string",
        width: "15%",
        align: "center",
      },
      {
        field: "type",
        name: "Type",
        sortable: true,
        dataType: "string",
        width: "90%",
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

  createRepo = async (repoName: string, type: string, settings: CreateRepositorySettings) => {
    try {
      const { snapshotManagementService } = this.props;

      const createRepoBody: CreateRepositoryBody = {
        type: type,
        settings: settings,
      };
      const response = await snapshotManagementService.createRepository(repoName, createRepoBody);
      if (response.ok) {
        this.setState({ showFlyout: false });
        this.context.notifications.toasts.addSuccess(`Created repository ${repoName}.`);
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
    for (let item of selectedItems) {
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
    console.log(`sm dev edit repo ${id}`);
    this.setState({ showFlyout: true, editRepo: id });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  render() {
    const { repositories, loading, selectedItems, showFlyout, isPopoverOpen, editRepo } = this.state;

    const popoverActionItems = [
      <EuiContextMenuItem
        key="Edit"
        icon="empty"
        disabled={selectedItems.length != 1}
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
          this.onClickDelete();
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
      <EuiPopover
        id="actionsPopover"
        button={popoverButton}
        isOpen={isPopoverOpen}
        closePopover={this.closePopover}
        panelPaddingSize="none"
        anchorPosition="downLeft"
        data-test-subj="actionPopover"
      >
        <EuiContextMenuPanel items={popoverActionItems} />
      </EuiPopover>,
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
      </>
    );
  }
}
