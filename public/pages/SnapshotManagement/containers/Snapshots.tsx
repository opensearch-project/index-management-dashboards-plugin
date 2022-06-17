/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import {
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButton,
  EuiEmptyPrompt,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiInMemoryTable,
  EuiLink,
  EuiSearchBar,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiTitle,
  Pagination,
  Query,
  SortDirection,
} from "@elastic/eui";
import { FieldValueSelectionFilterConfigType } from "@elastic/eui/src/components/search_bar/filters/field_value_selection_filter";
import { CoreServicesContext } from "../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { SnapshotManagementService, IndexService } from "../../../services";
import { OnSearchChangeArgs } from "../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, renderTimestampSecond } from "../utils/constants";
import { getErrorMessage } from "../../../utils/helpers";
import { CatSnapshotWithRepoAndPolicy as snapshotsWithRepoAndPolicy } from "../../../../server/models/interfaces";
import { ContentPanel } from "../../../components/ContentPanel";
import SnapshotFlyout from "../components/SnapshotFlyout";
import CreateSnapshotFlyout from "../components/CreateSnapshotFlyout";
import { Snapshot } from "../../../../models/interfaces";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
}

interface SnapshotsState {
  snapshots: snapshotsWithRepoAndPolicy[];
  existingPolicyNames: string[];
  loadingSnapshots: boolean;

  selectedItems: snapshotsWithRepoAndPolicy[];

  showFlyout: boolean; // show snapshot details flyout
  flyoutSnapshotId: string;
  flyoutSnapshotRepo: string;

  showCreateFlyout: boolean;

  message?: React.ReactNode;
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<snapshotsWithRepoAndPolicy>[];

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
      message: null,
    };

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
        dataType: "string",
        render: (name: string, item: snapshotsWithRepoAndPolicy) => (
          <EuiLink onClick={() => this.setState({ showFlyout: true, flyoutSnapshotId: name, flyoutSnapshotRepo: item.repository })}>
            {name}
          </EuiLink>
        ),
      },
      {
        field: "repository",
        name: "Repository",
        sortable: false,
        dataType: "string",
      },
      {
        field: "status",
        name: "Status",
        sortable: true,
        dataType: "string",
      },
      {
        field: "start_epoch",
        name: "Start time",
        sortable: true,
        dataType: "date",
        render: renderTimestampSecond,
      },
      {
        field: "end_epoch",
        name: "End time",
        sortable: true,
        dataType: "date",
        render: renderTimestampSecond,
      },
      {
        field: "policy",
        name: "Policy",
        sortable: false,
        dataType: "string",
        render: (name: string, item: snapshotsWithRepoAndPolicy) => {
          if (!!item.policy) {
            return <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${name}`)}>{name}</EuiLink>;
          }
          return "-";
        },
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
        const { snapshots, totalSnapshots } = response.response;
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

  onSelectionChange = (selectedItems: snapshotsWithRepoAndPolicy[]): void => {
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

  render() {
    const {
      snapshots,
      existingPolicyNames,
      selectedItems,
      loadingSnapshots,
      showFlyout,
      flyoutSnapshotId,
      flyoutSnapshotRepo,
      message,
      showCreateFlyout,
    } = this.state;

    console.log(`sm dev existingPolicyNames ${existingPolicyNames}`);

    console.log(`sm dev selectedItems ${JSON.stringify(selectedItems)}`);

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
      <EuiButton disabled={!selectedItems.length} onClick={this.onClickDelete} data-test-subj="deleteButton">
        Delete
      </EuiButton>,
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Take snapshot
      </EuiButton>,
    ];

    return (
      <>
        <ContentPanel title="Snapshots" actions={actions}>
          <EuiInMemoryTable
            items={snapshots}
            itemId={(item) => `${item.repository}:${item.id}`}
            columns={this.columns}
            pagination={true}
            sorting={{
              sort: {
                field: "id",
                direction: "desc",
              },
            }}
            isSelectable={true}
            selection={{ onSelectionChange: this.onSelectionChange }}
            search={search}
            loading={loadingSnapshots}
            // message={message}
            // error={error}
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
      </>
    );
  }
}
