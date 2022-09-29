/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import { EuiButton, EuiInMemoryTable, EuiLink, EuiTableFieldDataColumnType, EuiText, EuiPageHeader, EuiTabs, EuiTab, EuiOverlayMask } from "@elastic/eui";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService, IndexService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { CatSnapshotWithRepoAndPolicy as SnapshotsWithRepoAndPolicy } from "../../../../../server/models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import SnapshotFlyout from "../../components/SnapshotFlyout/SnapshotFlyout";
import CreateSnapshotFlyout from "../../components/CreateSnapshotFlyout";
import RestoreSnapshotFlyout from "../../components/RestoreSnapshotFlyout";
import RestoreActivitiesPanel from "../../components/RestoreActivitiesPanel";
import { Snapshot } from "../../../../../models/interfaces";
import { BREADCRUMBS, RESTORE_SNAPSHOT_DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import { renderTimestampMillis } from "../../../SnapshotPolicies/helpers";
import DeleteModal from "../../../Repositories/components/DeleteModal/DeleteModal";
import { snapshotStatusRender, truncateSpan } from "../../helper";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
}

interface SnapshotsState {
  snapshots: SnapshotsWithRepoAndPolicy[];
  existingPolicyNames: string[];
  loadingSnapshots: boolean;
  snapshotPanel: boolean;
  restoreStart: number;
  restoreCount: number;

  selectedItems: SnapshotsWithRepoAndPolicy[];

  showFlyout: boolean; // show snapshot details flyout
  flyoutSnapshotId: string;
  flyoutSnapshotRepo: string;

  showCreateFlyout: boolean;
  showRestoreFlyout: boolean;

  message?: React.ReactNode;

  isDeleteModalVisible: boolean;
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SnapshotsWithRepoAndPolicy>[];

  constructor(props: SnapshotsProps) {
    super(props);

    this.state = {
      snapshots: [],
      existingPolicyNames: [],
      loadingSnapshots: false,
      snapshotPanel: true,
      restoreStart: 0,
      restoreCount: 0,
      selectedItems: [],
      showFlyout: false,
      flyoutSnapshotId: "",
      flyoutSnapshotRepo: "",
      showCreateFlyout: false,
      showRestoreFlyout: false,
      message: null,
      isDeleteModalVisible: false,
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

    this.getSnapshots = _.debounce(this.getSnapshots, 500, { leading: true });
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS]);

    await this.getSnapshots();
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
        this.context.notifications.toasts.addDanger(response.error);
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
        this.context.notifications.toasts.addDanger(response.error);
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
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem creating the snapshot."));
    }
  };

  restoreSnapshot = async (snapshotId: string, repository: string, options: object) => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.restoreSnapshot(snapshotId, repository, options);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Restored snapshot ${snapshotId} to repository ${repository}.  View restore status in "Restore activities in progress" tab`);
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem restoring the snapshot."));
    }
  };

  getRestoreInfo = (time: number, count: number) => {
    this.setState({ restoreStart: time, restoreCount: count })
  }

  onClickRestore = async () => {
    this.setState({ showRestoreFlyout: true });
  };

  onCloseRestoreFlyout = () => {
    this.setState({ showRestoreFlyout: false });
  };

  onClickTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { selectedItems } = this.state;
    const target = e.currentTarget;
    const snapshotPanel = target.textContent === "Snapshots" ? true : false;
    const prev = target.previousElementSibling;
    const next = target.nextElementSibling;

    if (selectedItems.length === 0) {
      this.context.notifications.toasts.addWarning("Please select a snapshot to view restore activities");
      return;
    }

    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS]);

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

    let newState = { snapshotPanel: snapshotPanel, selectedItems }

    if (snapshotPanel) newState.selectedItems = [];

    this.setState(newState);
  };

  render() {
    const {
      snapshots,
      existingPolicyNames,
      selectedItems,
      loadingSnapshots,
      snapshotPanel,
      restoreStart,
      restoreCount,
      showFlyout,
      flyoutSnapshotId,
      flyoutSnapshotRepo,
      showCreateFlyout,
      showRestoreFlyout,
      isDeleteModalVisible,
    } = this.state;
    const { snapshotManagementService } = this.props;
    const repos = [...new Set(snapshots.map((snapshot) => snapshot.repository))];
    const status = [...new Set(snapshots.map((snapshot) => snapshot.status))];
    const search = {
      box: {
        placeholder: "Search snapshot",
      },
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
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Take snapshot
      </EuiButton>,
    ];

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Snapshots are taken automatically from snapshot policies, <br />or you can initiate manual snapshots to save to a repository.<br />
          You can restore indices by selecting a snapshot.
        </p>
      </EuiText>
    );

    return (
      <>
        <EuiPageHeader>
          <EuiTabs size="m" >
            <EuiTab isSelected={true} onClick={this.onClickTab} >Snapshots</EuiTab>
            <EuiTab onClick={this.onClickTab} >Restore activities in progress</EuiTab>
          </EuiTabs>
        </EuiPageHeader>
        {snapshotPanel || (
          <RestoreActivitiesPanel
            snapshotManagementService={snapshotManagementService}
            repository={selectedItems[0].repository}
            snapshotId={selectedItems[0].id}
            restoreStartRef={restoreStart}
            restoreCount={restoreCount}
          />
        )}

        {snapshotPanel && (
          <ContentPanel title="Snapshots" actions={actions} subTitleText={subTitleText}>
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

        {showRestoreFlyout && (
          <EuiOverlayMask onClick={this.onCloseRestoreFlyout} headerZindexLocation="below">
            <RestoreSnapshotFlyout
              snapshotManagementService={this.props.snapshotManagementService}
              indexService={this.props.indexService}
              onCloseFlyout={this.onCloseRestoreFlyout}
              getRestoreInfo={this.getRestoreInfo}
              restoreSnapshot={this.restoreSnapshot}
              snapshotId={selectedItems[0].id}
              repository={selectedItems[0].repository}
            />
          </EuiOverlayMask>
        )}

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
