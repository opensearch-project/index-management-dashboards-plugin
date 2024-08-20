/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import {
  EuiInMemoryTable,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiPageHeader,
  EuiTabs,
  EuiTab,
  EuiOverlayMask,
  EuiGlobalToastList,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiButtonIcon,
  EuiButton,
} from "@elastic/eui";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService, IndexService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { Toast, RestoreError } from "../../../../models/interfaces";
import { CatSnapshotWithRepoAndPolicy as SnapshotsWithRepoAndPolicy } from "../../../../../server/models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import SnapshotFlyout from "../../components/SnapshotFlyout/SnapshotFlyout";
import CreateSnapshotFlyout from "../../components/CreateSnapshotFlyout";
import RestoreSnapshotFlyout from "../../components/RestoreSnapshotFlyout";
import RestoreActivitiesPanel from "../../components/RestoreActivitiesPanel";
import { Snapshot } from "../../../../../models/interfaces";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { renderTimestampMillis } from "../../../SnapshotPolicies/helpers";
import ErrorModal from "../../../Snapshots/components/ErrorModal/ErrorModal";
import DeleteModal from "../../../Repositories/components/DeleteModal/DeleteModal";
import { getToasts } from "../../helper";
import { snapshotStatusRender, truncateSpan } from "../../helper";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

interface SnapshotsProps extends RouteComponentProps, DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
}

interface SnapshotsState extends DataSourceMenuProperties {
  snapshots: SnapshotsWithRepoAndPolicy[];
  existingPolicyNames: string[];
  loadingSnapshots: boolean;
  snapshotPanel: boolean;
  restoreStart: number;
  indicesToRestore: string;
  toasts: Toast[];
  viewError: boolean;
  error: RestoreError;

  selectedItems: SnapshotsWithRepoAndPolicy[];

  showFlyout: boolean; // show snapshot details flyout
  flyoutSnapshotId: string;
  flyoutSnapshotRepo: string;

  showCreateFlyout: boolean;
  showRestoreFlyout: boolean;

  message?: React.ReactNode;

  isDeleteModalVisible: boolean;
  isPopoverOpen: boolean;
  useNewUX: boolean;
}

export class Snapshots extends MDSEnabledComponent<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SnapshotsWithRepoAndPolicy>[];
  private tabsRef;

  constructor(props: SnapshotsProps) {
    super(props);
    const uiSettings = getUISettings();
    const useNewUX = uiSettings.get("home:useNewHomePage");
    this.state = {
      ...this.state,
      snapshots: [],
      existingPolicyNames: [],
      loadingSnapshots: false,
      snapshotPanel: true,
      restoreStart: 0,
      indicesToRestore: "",
      toasts: [],
      error: {},
      viewError: false,
      selectedItems: [],
      showFlyout: false,
      flyoutSnapshotId: "",
      flyoutSnapshotRepo: "",
      showCreateFlyout: false,
      showRestoreFlyout: false,
      message: null,
      isDeleteModalVisible: false,
      isPopoverOpen: false,
      useNewUX: useNewUX,
    };

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
        dataType: "string",
        width: "25%",
        render: (name: string, item: SnapshotsWithRepoAndPolicy) => {
          const truncated = _.truncate(name, { length: 80 });
          return (
            <EuiLink onClick={() => this.setState({ showFlyout: true, flyoutSnapshotId: name, flyoutSnapshotRepo: item.repository })}>
              <span title={name}>{truncated}</span>
            </EuiLink>
          );
        },
      },
      {
        field: "status",
        name: "Snapshot status",
        sortable: true,
        dataType: "string",
        render: (value: string) => {
          return snapshotStatusRender(value.replace("_", " "));
        },
      },
      {
        field: "policy",
        name: "Policy",
        sortable: false,
        dataType: "string",
        render: (name: string, item: SnapshotsWithRepoAndPolicy) => {
          const truncated = _.truncate(name, { length: 20 });
          if (!!item.policy) {
            return <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${name}`)}>{truncated}</EuiLink>;
          }
          return "-";
        },
      },
      {
        field: "repository",
        name: "Repository",
        sortable: false,
        dataType: "string",
        render: (value: string, item: SnapshotsWithRepoAndPolicy) => {
          return truncateSpan(value);
        },
      },
      {
        field: "end_epoch",
        name: "Time last updated",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
    ];

    this.tabsRef = React.createRef<HTMLDivElement>();
    this.getSnapshots = _.debounce(this.getSnapshots, 500, { leading: true });
  }

  async componentDidMount() {
    const breadCrumbs = this.state.useNewUX ? [BREADCRUMBS.INDEX_SNAPSHOTS] : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS];
    this.context.chrome.setBreadcrumbs(breadCrumbs);

    await this.getSnapshots();
  }

  async componentDidUpdate(prevProps: SnapshotsProps, prevState: SnapshotsState) {
    const prevQuery = Snapshots.getQueryObjectFromState(prevState);
    const currQuery = Snapshots.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getSnapshots();
    }
  }

  static getQueryObjectFromState({ dataSourceId, multiDataSourceEnabled }: SnapshotsState) {
    return {
      ...(multiDataSourceEnabled ? { dataSourceId } : {}),
    };
  }

  getSnapshots = async () => {
    this.setState({ loadingSnapshots: true, message: "Loading snapshots..." });

    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getAllSnapshotsWithPolicy();
      if (response.ok) {
        const { snapshots } = response.response;
        const existingPolicyNames = [
          ...new Set(snapshots.filter((snapshot) => !!snapshot.policy).map((snapshot) => snapshot.policy)),
        ] as string[];
        this.setState({ snapshots, existingPolicyNames });
      } else {
        const message = JSON.parse(response.error).error.root_cause[0].reason;
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem getting the snapshots.`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`,
        });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    } finally {
      this.setState({ loadingSnapshots: false, message: null });
    }
  };

  onSelectionChange = (selectedItems: SnapshotsWithRepoAndPolicy[]): void => {
    if (this.state.showRestoreFlyout) return;
    this.setState({ selectedItems });
  };

  onCloseFlyout = () => {
    this.setState({ showFlyout: false });
  };

  onClickDelete = async () => {
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      await this.deleteSnapshot(item.id, item.repository);
    }
    await this.getSnapshots();
  };

  deleteSnapshot = async (snapshotId: string, repository: string) => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.deleteSnapshot(snapshotId, repository);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Deleted snapshot ${snapshotId} from repository ${repository}.`);
      } else {
        const message = JSON.parse(response.error).error.root_cause[0].reason;
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem deleting the snapshot.`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`,
        });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem deleting the snapshot."));
    }
  };

  onClickCreate = () => {
    this.setState({ showCreateFlyout: true });
  };

  onCloseCreateFlyout = () => {
    this.setState({ showCreateFlyout: false });
  };

  createSnapshot = async (snapshotId: string, repository: string, snapshot: Snapshot) => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.createSnapshot(snapshotId, repository, snapshot);
      if (response.ok) {
        this.setState({ showCreateFlyout: false });
        this.context.notifications.toasts.addSuccess(`Created snapshot ${snapshotId} in repository ${repository}.`);
        await this.getSnapshots();
      } else {
        const message = JSON.parse(response.error).error.root_cause[0].reason;
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);

        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem creating the snapshot.`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`,
        });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem creating the snapshot."));
    }
  };

  restoreSnapshot = async (snapshotId: string, repository: string, options: object) => {
    try {
      await this.setState({ toasts: [], indicesToRestore: options.indices });
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.restoreSnapshot(snapshotId, repository, options);

      if (response.ok) {
        this.onRestore(true, response);
      } else {
        this.onRestore(false, JSON.parse(response.error).error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem restoring the snapshot."));
    }
  };

  onRestore = (success: boolean, error: object = {}) => {
    const { selectedItems } = this.state;
    let errorMessage: string | undefined;
    if (!success) {
      let optionalMessage = "";

      if (error.reason.indexOf("open index with same name") >= 0) {
        optionalMessage = "You have an index with the same name. Try a different prefix.";
      }
      errorMessage = `${optionalMessage}`;
    }

    const toasts = success
      ? getToasts("success_restore_toast", errorMessage, selectedItems[0].id, this.onClickTab)
      : getToasts("error_restore_toast", errorMessage, selectedItems[0].id, this.onOpenError);
    this.setState({ toasts, error: error });
  };

  onOpenError = () => {
    this.setState({ viewError: true });
  };

  collectError = (error: object) => {
    this.setState(error);
  };

  collectToast = (toasts: Toast[]) => {
    this.setState({ toasts: toasts });
  };

  onCloseModal = () => {
    this.setState({ viewError: false, error: {} });
  };

  getRestoreTime = (time: number) => {
    this.setState({ restoreStart: time });
  };

  onClickRestore = async () => {
    const { selectedItems } = this.state;
    const snapshot = selectedItems[0];
    const errorMessage = `${snapshot.id} is not available for restore`;
    const failedText = "This shapshot is incomplete. Pick another snapshot to restore.";
    const inProgressText = "This snapshot is still being created. Try again once the snapshot has been completed.";

    if (snapshot.status === "FAILED" || snapshot.status === "IN_PROGRESS") {
      const errorText = snapshot.status === "IN_PROGRESS" ? inProgressText : failedText;
      this.context.notifications.toasts.addDanger(null, { title: errorMessage, text: errorText });
      return;
    }
    this.setState({ showRestoreFlyout: true });
  };

  onToastEnd = () => {
    this.setState({ toasts: [] });
  };

  onCloseRestoreFlyout = () => {
    this.setState({ showRestoreFlyout: false });
  };

  onClickTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { selectedItems } = this.state;
    const target = e.currentTarget;
    const titleName = this.state.useNewUX ? "Index snapshots" : "Snapshots";
    const snapshotPanel = target.textContent === titleName ? true : false;
    const prev = target.previousElementSibling;
    const next = target.nextElementSibling;

    if (snapshotPanel) {
      const breadCrumbs = this.state.useNewUX ? [BREADCRUMBS.INDEX_SNAPSHOTS] : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS];
      this.context.chrome.setBreadcrumbs(breadCrumbs);
    }

    if (target.textContent !== "View restore activities") {
      target.ariaSelected = "true";
      target.classList.add("euiTab-isSelected");

      if (prev) {
        prev.classList.remove("euiTab-isSelected");
        prev.ariaSelected = "false";
      }

      if (next) {
        next.classList.remove("euiTab-isSelected");
        next.ariaSelected = "false";
      }
    } else {
      const firstTab = this.tabsRef.current?.firstChild;
      const secondTab = this.tabsRef.current?.lastChild;

      firstTab!.ariaSelected = "false";
      firstTab!.classList.remove("euiTab-isSelected");

      secondTab!.ariaSelected = "true";
      secondTab!.classList.add("euiTab-isSelected");
    }
    let newState = { snapshotPanel: snapshotPanel, selectedItems };

    if (snapshotPanel) newState.selectedItems = [];

    this.setState(newState);
  };

  onActionButtonClick = () => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  render() {
    const {
      snapshots,
      existingPolicyNames,
      selectedItems,
      loadingSnapshots,
      snapshotPanel,
      toasts,
      viewError,
      error,
      restoreStart,
      indicesToRestore,
      showFlyout,
      flyoutSnapshotId,
      flyoutSnapshotRepo,
      showCreateFlyout,
      showRestoreFlyout,
      isDeleteModalVisible,
      isPopoverOpen,
      useNewUX,
    } = this.state;
    const { snapshotManagementService } = this.props;
    const repos = [...new Set(snapshots.map((snapshot) => snapshot.repository))];
    const status = [...new Set(snapshots.map((snapshot) => snapshot.status))];

    const popoverActionItems = [
      <EuiContextMenuItem
        key="Delete"
        disabled={!selectedItems.length}
        onClick={() => {
          this.closePopover();
          this.showDeleteModal();
        }}
        data-test-subj="deleteButton"
      >
        Delete
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        disabled={selectedItems.length !== 1}
        onClick={() => {
          this.closePopover();
          this.onClickRestore();
        }}
        data-test-subj="restoreButton"
      >
        Restore
      </EuiContextMenuItem>,
    ];

    const renderToolsRight = () => {
      return [
        <EuiButtonIcon iconType="refresh" onClick={this.getSnapshots} aria-label="refresh" size="s" display="base" />,
        <EuiPopover
          id="action"
          button={actionsButton}
          isOpen={isPopoverOpen}
          closePopover={this.closePopover}
          anchorPosition="downRight"
          panelPaddingSize="s"
        >
          <EuiContextMenuPanel size="s" items={popoverActionItems} />
        </EuiPopover>,
      ];
    };

    const actionsButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
        size="s"
      >
        Actions
      </EuiButton>
    );

    const search = {
      toolsRight: useNewUX ? renderToolsRight() : undefined,
      box: {
        placeholder: "Search snapshot",
        incremental: true,
        compressed: useNewUX ? true : false,
      },
      compressed: true,
      filters: [
        {
          type: "field_value_selection",
          field: "repository",
          name: "Repository",
          options: repos.map((repo) => ({ value: repo })),
          multiSelect: "or",
        } as FieldValueSelectionFilterConfigType,
        {
          type: "field_value_selection",
          field: "status",
          name: "Status",
          options: status.map((s) => ({ value: s })),
          multiSelect: "or",
        } as FieldValueSelectionFilterConfigType,
        {
          type: "field_value_selection",
          field: "policy",
          name: "Policy",
          options: existingPolicyNames.map((p) => ({ value: p })),
          multiSelect: "or",
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    const actions = [
      <EuiButton iconType="refresh" onClick={this.getSnapshots} data-test-subj="refreshButton">
        Refresh
      </EuiButton>,
      <EuiButton disabled={!selectedItems.length} onClick={this.showDeleteModal} data-test-subj="deleteButton" color="danger">
        Delete
      </EuiButton>,
      <EuiButton disabled={selectedItems.length !== 1} onClick={this.onClickRestore} color="primary" data-test-subj="restoreButton">
        Restore
      </EuiButton>,
      <EuiButton onClick={this.onClickCreate} fill={true} data-test-subj="takeSnapshotButton">
        Take snapshot
      </EuiButton>,
    ];

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Snapshots of indices are taken automatically from snapshot policies, <br />
          or you can initiate manual snapshots to save to a repository.
          <br />
          You can restore indices by selecting a snapshot.
        </p>
      </EuiText>
    );

    const controlControlsData = [
      {
        id: "Take snapshot",
        label: "Take snapshot",
        fill: true,
        run: this.onClickCreate,
        testId: "takeSnapshot",
        controlType: "button",
      },
    ];

    const descriptionData = [
      {
        renderComponent: (
          <EuiText size="s" color="subdued">
            Index snapshots are taken automatically from snapshot policies, or you can initiate manual snapshots to save to a repository.{" "}
            <br></br>
            You can restore indices by selecting a snapshot.
          </EuiText>
        ),
      },
    ];

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppDescriptionControls } = getApplication();
    const showTitle = useNewUX ? undefined : "Snapshots";
    const SnapshotTabName = useNewUX ? "Index snapshots" : "Snapshots";
    const useActions = useNewUX ? undefined : actions;
    const useSubTitle = useNewUX ? undefined : subTitleText;

    return (
      <>
        {useNewUX ? (
          <>
            <HeaderControl setMountPoint={setAppRightControls} controls={controlControlsData} />
            <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />
          </>
        ) : null}
        <EuiPageHeader>
          <EuiTabs size="s" ref={this.tabsRef}>
            <EuiTab isSelected={true} onClick={this.onClickTab}>
              {SnapshotTabName}
            </EuiTab>
            <EuiTab onClick={this.onClickTab}>Restore activities in progress</EuiTab>
          </EuiTabs>
        </EuiPageHeader>
        {snapshotPanel || (
          <RestoreActivitiesPanel
            snapshotManagementService={snapshotManagementService}
            onOpenError={this.onOpenError}
            sendError={this.collectError}
            sendToasts={this.collectToast}
            snapshotId={selectedItems[0]?.id || ""}
            restoreStartRef={restoreStart || 0}
            indicesToRestore={indicesToRestore.split(",")}
            useNewUX={useNewUX}
          />
        )}

        {snapshotPanel && (
          <ContentPanel title={showTitle} actions={useActions} subTitleText={useSubTitle}>
            <EuiInMemoryTable
              items={snapshots}
              itemId={(item) => `${item.repository}:${item.id}`}
              columns={this.columns}
              pagination={true}
              sorting={{
                sort: {
                  field: "end_epoch",
                  direction: "desc",
                },
              }}
              isSelectable={true}
              selection={{ onSelectionChange: this.onSelectionChange }}
              search={search}
              loading={loadingSnapshots}
            />
          </ContentPanel>
        )}

        {showFlyout && (
          <SnapshotFlyout
            snapshotId={flyoutSnapshotId}
            repository={flyoutSnapshotRepo}
            snapshotManagementService={this.props.snapshotManagementService}
            onCloseFlyout={this.onCloseFlyout}
            history={this.props.history}
          />
        )}

        {showCreateFlyout && (
          <CreateSnapshotFlyout
            snapshotManagementService={this.props.snapshotManagementService}
            indexService={this.props.indexService}
            onCloseFlyout={this.onCloseCreateFlyout}
            createSnapshot={this.createSnapshot}
          />
        )}

        {/* Overlay added to preserve correct Delete/Restore button status, accurately depict selected snapshots upon leaving flyout */}
        {showRestoreFlyout && (
          <EuiOverlayMask onClick={this.onCloseRestoreFlyout} headerZindexLocation="below">
            <RestoreSnapshotFlyout
              snapshotManagementService={this.props.snapshotManagementService}
              indexService={this.props.indexService}
              onCloseFlyout={this.onCloseRestoreFlyout}
              getRestoreTime={this.getRestoreTime}
              restoreSnapshot={this.restoreSnapshot}
              snapshotId={selectedItems[0].id}
              repository={selectedItems[0].repository}
            />
          </EuiOverlayMask>
        )}

        <EuiGlobalToastList toasts={toasts} dismissToast={this.onToastEnd} toastLifeTimeMs={6000} />

        {viewError && <ErrorModal onClick={this.onCloseModal} onClose={this.onCloseModal} snapshotId={selectedItems[0].id} error={error} />}

        {isDeleteModalVisible && (
          <DeleteModal
            type="snapshot"
            ids={this.getSelectedIds()}
            closeDeleteModal={this.closeDeleteModal}
            onClickDelete={this.onClickDelete}
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
      .map((item: SnapshotsWithRepoAndPolicy) => {
        return item.id;
      })
      .join(", ");
  };
}

export default function (props: Omit<SnapshotsProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <Snapshots {...props} {...dataSourceMenuProps} />;
}
