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
  EuiInMemoryTable,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiTitle,
  Pagination,
  SortDirection,
} from "@elastic/eui";
import { CoreServicesContext } from "../../../components/core_services";
import { BREADCRUMBS } from "../../../utils/constants";
import { SnapshotManagementService } from "../../../services";
import { getURLQueryParams } from "../utils/helpers";
import { OnSearchChangeArgs, SnapshotItem } from "../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, SNAPSHOTS_COLUMNS } from "../utils/constants";
import { getErrorMessage } from "../../../utils/helpers";
import { CatSnapshot } from "../../../../server/models/interfaces";
import { ContentPanel } from "../../../components/ContentPanel";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotsState {
  snapshots: SnapshotItem[];
  loadingSnapshots: boolean;
  from: number;
  size: number;
  totalSnapshots: number;
  sortField: keyof SnapshotItem;
  sortDirection: Direction;
  selectedItems: SnapshotItem[];
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;

  constructor(props: SnapshotsProps) {
    super(props);

    const { from, size, sortField, sortDirection } = getURLQueryParams(this.props.location);
    this.state = {
      snapshots: [],
      loadingSnapshots: false,
      from: from,
      size: size,
      totalSnapshots: 10,
      sortField: sortField,
      sortDirection: sortDirection,
      selectedItems: [],
    };

    this.getSnapshots = _.debounce(this.getSnapshots, 500, { leading: true });
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOTS]);
    await this.getSnapshots();
  }

  async componentDidUpdate(prevProps: SnapshotsProps, prevState: SnapshotsState) {
    const prevQuery = Snapshots.getQueryObjectFromState(prevState);
    const currQuery = Snapshots.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getSnapshots();
    }
  }

  static getQueryObjectFromState({ from, size, sortField, sortDirection }: SnapshotsState) {
    return { from, size, sortField, sortDirection };
  }

  getSnapshots = async () => {
    this.setState({ loadingSnapshots: true });

    try {
      const { snapshotManagementService, history } = this.props;
      const queryParamsObject = Snapshots.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryParamsObject);
      history.replace({ ...this.props.location, search: queryParamsString });

      const response = await snapshotManagementService.getSnapshots({ ...queryParamsObject });
      if (response.ok) {
        const { snapshots, totalSnapshots } = response.response;
        this.setState({ snapshots, totalSnapshots });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    }

    this.setState({ loadingSnapshots: false });
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<CatSnapshot>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: SnapshotItem[]): void => {
    this.setState({ selectedItems });
  };

  render() {
    const {
      snapshots,
      from,
      size,
      totalSnapshots,
      // sortField,
      // sortDirection,
      selectedItems, // enable/disable action button
    } = this.state;

    console.log(`sm dev selectedItems ${JSON.stringify(selectedItems)}`);

    const page = Math.floor(from / size);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalSnapshots,
    };

    // const sorting: EuiTableSortingType<SnapshotItem> = {
    //   sort: {
    //     direction: sortDirection,
    //     field: sortField,
    //   },
    // };

    const sorting = {
      sort: {
        field: "start_epoch",
        direction: SortDirection.DESC,
      },
    };

    const selection: EuiTableSelectionType<SnapshotItem> = {
      onSelectionChange: this.onSelectionChange,
    };

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
        },
      ],
    };

    return (
      <ContentPanel
        title="Snapshots"
        actions={
          <EuiButton iconType="refresh" onClick={this.getSnapshots} data-test-subj="refreshButton">
            Refresh
          </EuiButton>
        }
      >
        <EuiInMemoryTable
          items={snapshots}
          itemId={(item) => `${item.id}${item.repository}`}
          columns={SNAPSHOTS_COLUMNS}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          // onChange={this.onTableChange}
          // noItemsMessage={null}
          search={search}
          // loading={loading}
          // error={error}
          // message={message}
        />
      </ContentPanel>
    );
  }
}
