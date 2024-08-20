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
  EuiButtonIcon,
} from "@elastic/eui";
import { getErrorMessage } from "../../../../utils/helpers";
import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CatRepository, CreateRepositoryBody, CreateRepositorySettings } from "../../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService } from "../../../../services";
import { ContentPanel } from "../../../../components/ContentPanel";
import CreateRepositoryFlyout from "../../components/CreateRepositoryFlyout";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { BREADCRUMBS } from "../../../../utils/constants";
import DeleteModal from "../../components/DeleteModal";
import { truncateSpan } from "../../../Snapshots/helper";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

interface RepositoriesProps extends RouteComponentProps, DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
}

interface RepositoriesState extends DataSourceMenuProperties {
  repositories: CatRepository[];
  loading: boolean;
  selectedItems: CatRepository[];

  showFlyout: boolean;

  isPopoverOpen: boolean;

  editRepo: string | null;

  isDeleteModalVisible: boolean;
  useNewUX: boolean;
}

export class Repositories extends MDSEnabledComponent<RepositoriesProps, RepositoriesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<CatRepository>[];

  constructor(props: RepositoriesProps) {
    super(props);

    const uiSettings = getUISettings();
    const useNewUX = uiSettings.get("home:useNewHomePage");
    this.state = {
      ...this.state,
      repositories: [],
      loading: false,
      selectedItems: [],
      showFlyout: false,
      isPopoverOpen: false,
      editRepo: null,
      isDeleteModalVisible: false,
      useNewUX: useNewUX,
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
    const breadCrumbs = this.state.useNewUX
      ? [BREADCRUMBS.SNAPSHOT_REPOSITORIES]
      : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.REPOSITORIES];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    await this.getRepos();
  }

  async componentDidUpdate(prevProps: RepositoriesProps, prevState: RepositoriesState) {
    const prevQuery = Repositories.getQueryObjectFromState(prevState);
    const currQuery = Repositories.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getRepos();
    }
  }

  static getQueryObjectFromState({ dataSourceId, multiDataSourceEnabled }: RepositoriesState) {
    return {
      ...(multiDataSourceEnabled ? { dataSourceId } : {}),
    };
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
        settings: settings,
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
    this.setState({ showFlyout: true, editRepo: id });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  render() {
    const { repositories, loading, selectedItems, showFlyout, isPopoverOpen, editRepo, isDeleteModalVisible, useNewUX } = this.state;
    const popoverActionItems = [
      <EuiContextMenuItem
        key="Edit"
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

    const renderToolsRight = () => {
      return [
        <EuiButtonIcon
          iconType="refresh"
          onClick={this.getRepos}
          data-test-subj="refreshButton"
          aria-label="refresh"
          size="s"
          display="base"
        />,
      ];
    };

    const renderToolsLeft = () => {
      return [
        <EuiButton
          iconType="trash"
          iconSide="left"
          iconSize="s"
          disabled={!selectedItems.length}
          onClick={this.showDeleteModal}
          data-test-subj="deleteButton"
          aria-label="delete"
          color="danger"
          size="s"
          minWidth={75}
        >
          Delete
        </EuiButton>,
      ];
    };

    const search = {
      toolsRight: useNewUX ? renderToolsRight() : undefined,
      toolsLeft: useNewUX ? renderToolsLeft() : undefined,
      box: {
        placeholder: "Search repository",
        compressed: useNewUX ? true : false,
        increamental: true,
      },
      compressed: true,
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

    const descriptionData = [
      {
        renderComponent: (
          <EuiText size="s" color="subdued">
            Repositories are remote storage locations used to store snapshots.
          </EuiText>
        ),
      },
    ];

    const controlControlsData = [
      {
        id: "Create repository",
        label: "Create repository",
        iconType: "plus",
        fill: true,
        run: this.onClickCreate,
        testId: "createRepo",
        controlType: "button",
      },
    ];

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppDescriptionControls } = getApplication();
    const useTitle = useNewUX ? undefined : "Repositories";
    const useActions = useNewUX ? undefined : actions;
    const useSubTitleText = useNewUX ? undefined : subTitleText;

    return (
      <>
        {useNewUX ? (
          <>
            <HeaderControl setMountPoint={setAppRightControls} controls={controlControlsData} />
            <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />
          </>
        ) : null}
        <ContentPanel title={useTitle} actions={useActions} subTitleText={useSubTitleText}>
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

export default function (props: Omit<RepositoriesProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <Repositories {...props} {...dataSourceMenuProps} />;
}
