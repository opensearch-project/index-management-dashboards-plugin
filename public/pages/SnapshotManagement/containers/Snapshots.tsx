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
import { SnapshotManagementService } from "../../../services";
import { getSnapshotsQueryParamsFromURL } from "../utils/helpers";
import { OnSearchChangeArgs } from "../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, renderTimestampSecond } from "../utils/constants";
import { getErrorMessage } from "../../../utils/helpers";
import { CatSnapshotWithRepoAndPolicy } from "../../../../server/models/interfaces";
import { ContentPanel } from "../../../components/ContentPanel";
import SnapshotFlyout from "../components/SnapshotFlyout";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotsState {
  snapshots: CatSnapshotWithRepoAndPolicy[];
  filteredSnapshots: CatSnapshotWithRepoAndPolicy[];
  // from: number;
  // size: number;
  // totalSnapshots: number;
  // sortField: keyof CatSnapshot;
  // sortDirection: Direction;
  selectedItems: CatSnapshotWithRepoAndPolicy[];

  showFlyout: boolean;
  flyoutSnapshotId: string;

  loadingSnapshots: boolean;
  message?: React.ReactNode;
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<CatSnapshotWithRepoAndPolicy>[];

  constructor(props: SnapshotsProps) {
    super(props);

    this.state = {
      snapshots: [],
      filteredSnapshots: [],
      loadingSnapshots: false,
      // from: from,
      // size: size,
      // totalSnapshots: 0,
      // sortField: sortField,
      // sortDirection: sortDirection,
      selectedItems: [],
      showFlyout: false,
      flyoutSnapshotId: "",
      message: null,
    };

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
        dataType: "string",
        render: (name: string, item: CatSnapshotWithRepoAndPolicy) => (
          <EuiLink onClick={() => this.setState({ showFlyout: true, flyoutSnapshotId: name })}>{name}</EuiLink>
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
        render: (name: string, item: CatSnapshotWithRepoAndPolicy) => (
          <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${name}`)}>{name}</EuiLink>
        ),
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
      const response = await snapshotManagementService.getSnapshots();
      if (response.ok) {
        const { snapshots, totalSnapshots } = response.response;
        this.setState({ snapshots, filteredSnapshots: snapshots });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    } finally {
      this.setState({ loadingSnapshots: false, message: null });
    }
  };

  onSelectionChange = (selectedItems: CatSnapshotWithRepoAndPolicy[]): void => {
    this.setState({ selectedItems });
  };

  onCloseFlyout = () => {
    this.setState({ showFlyout: false });
  };

  render() {
    const { snapshots, filteredSnapshots, selectedItems, loadingSnapshots, showFlyout, flyoutSnapshotId, message } = this.state;

    console.log(`sm dev selectedItems ${JSON.stringify(selectedItems)}`);

    const repos = [...new Set(snapshots.map((snapshot) => snapshot.repository))];
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
      ],
    };

    return (
      <>
        <ContentPanel
          title="Snapshots"
          actions={
            <EuiButton iconType="refresh" onClick={this.getSnapshots} data-test-subj="refreshButton">
              Refresh
            </EuiButton>
          }
        >
          <EuiInMemoryTable
            items={filteredSnapshots}
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
            snapshotManagementService={this.props.snapshotManagementService}
            onCloseFlyout={this.onCloseFlyout}
          />
        )}
      </>
    );
  }
}
