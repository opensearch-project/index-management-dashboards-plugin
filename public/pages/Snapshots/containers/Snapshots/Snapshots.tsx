/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import { EuiButton, EuiInMemoryTable, EuiLink, EuiTableFieldDataColumnType, EuiText } from "@elastic/eui";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService, IndexService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { CatSnapshotWithRepoAndPolicy as SnapshotsWithRepoAndPolicy } from "../../../../../server/models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import SnapshotFlyout from "../../components/SnapshotFlyout/SnapshotFlyout";
import CreateSnapshotFlyout from "../../components/CreateSnapshotFlyout/CreateSnapshotFlyout";
import RestoreSnapshotFlyout from "../../components/RestoreSnapshotFlyout/RestoreSnapshotFlyout";
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
        name: "Status",
        sortable: true,
        dataType: "string",
        width: "130px",
        render: (value: string) => {
          return snapshotStatusRender(value);
        },
      },
      {
        field: "policy",
        name: "Policy",
        sortable: false,
        dataType: "string",
        width: "160px",
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
        width: "150px",
        dataType: "string",
        render: (value: string, item: SnapshotsWithRepoAndPolicy) => {
          return truncateSpan(value);
        },
      },
      {
        field: "start_epoch",
        name: "Start time",
        sortable: true,
        dataType: "date",
        width: "150px",
        render: renderTimestampMillis,
      },
      {
        field: "end_epoch",
        name: "End time",
        sortable: true,
        dataType: "date",
        width: "150px",
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

  restoreSnapshot = async (snapshotId: string, repository: string) => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.restoreSnapshot(snapshotId, repository);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Restored snapshot ${snapshotId} to repository ${repository}.`);
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem restoring the snapshot."));
    }
  };

  onClickRestore = async () => {
    const { selectedItems } = this.state;
    await this.restoreSnapshot(selectedItems[0].id, selectedItems[0].repository);
    this.setState({ showRestoreFlyout: true });
  };

  onCloseRestoreFlyout = () => {
    this.setState({ showRestoreFlyout: false });
  };

  render() {
    const {
      snapshots,
      existingPolicyNames,
      selectedItems,
      loadingSnapshots,
      showFlyout,
      flyoutSnapshotId,
      flyoutSnapshotRepo,
      showCreateFlyout,
      showRestoreFlyout,
      isDeleteModalVisible,
    } = this.state;

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
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Take snapshot
      </EuiButton>,
      <EuiButton disabled={!selectedItems.length} color="secondary">
        Restore
      </EuiButton>,
    ];

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Snapshots are taken automatically from snapshot policies, or you can initiate manual snapshots to save to a repository. <br />
          To restore a snapshot, use the snapshot restore API.{" "}
          <EuiLink href={RESTORE_SNAPSHOT_DOCUMENTATION_URL} target="_blank">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

    return (
      <>
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
          <RestoreSnapshotFlyout
            snapshotManagementService={this.props.snapshotManagementService}
            indexService={this.props.indexService}
            onCloseFlyout={this.onCloseCreateFlyout}
            restoreSnapshot={this.restoreSnapshot}
          />
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
