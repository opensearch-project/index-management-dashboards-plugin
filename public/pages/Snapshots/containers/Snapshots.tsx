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
  EuiSearchBar,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiTitle,
  Pagination,
  Query,
  SortDirection,
} from "@elastic/eui";
import { CoreServicesContext } from "../../../components/core_services";
import { BREADCRUMBS } from "../../../utils/constants";
import { SnapshotManagementService } from "../../../services";
import { getSnapshotsQueryParamsFromURL } from "../utils/helpers";
import { OnSearchChangeArgs } from "../models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, renderTimestampSecond } from "../utils/constants";
import { getErrorMessage } from "../../../utils/helpers";
import { CatSnapshot } from "../../../../server/models/interfaces";
import { ContentPanel } from "../../../components/ContentPanel";

interface SnapshotsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotsState {
  snapshots: CatSnapshot[];
  loadingSnapshots: boolean;
  query: Query;
  from: number;
  size: number;
  totalSnapshots: number;
  sortField: keyof CatSnapshot;
  sortDirection: Direction;
  selectedItems: CatSnapshot[];
}

export default class Snapshots extends Component<SnapshotsProps, SnapshotsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<CatSnapshot>[];
  initialQuery = Query.MATCH_ALL;

  constructor(props: SnapshotsProps) {
    super(props);

    const { from, size, sortField, sortDirection } = getSnapshotsQueryParamsFromURL(this.props.location);
    this.state = {
      snapshots: [],
      loadingSnapshots: false,
      query: this.initialQuery,
      from: from,
      size: size,
      totalSnapshots: 0,
      sortField: sortField,
      sortDirection: sortDirection,
      selectedItems: [],
    };

    this.columns = [
      {
        field: "id",
        name: "Name",
        sortable: true,
        dataType: "string",
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
      },
    ];
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

  onTableChange = (criteria: Criteria<CatSnapshot>): void => {
    const { from: prevFrom, size: prevSize, sortField, sortDirection } = this.state;
    const { page: { index, size } = {}, sort: { field, direction } = {} } = criteria;

    this.setState({
      from: index ? (size ? index * size : prevFrom) : prevFrom,
      size: size ?? prevSize,
      sortField: field ?? sortField,
      sortDirection: direction ?? sortDirection,
    });
  };

  onSelectionChange = (selectedItems: CatSnapshot[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = ({ query, error }: OnSearchChangeArgs) => {
    this.setState({ query });
  };

  render() {
    const { snapshots, query, from, size, totalSnapshots, sortField, sortDirection, selectedItems } = this.state;

    console.log(`sm dev selectedItems ${JSON.stringify(selectedItems)}`);

    const pageIndex = Math.floor(from / size);
    const pagination: Pagination = {
      pageIndex: pageIndex,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalSnapshots,
    };
    let paginatedSnapshots = snapshots.slice(from, from + size);

    const sorting: EuiTableSortingType<CatSnapshot> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<CatSnapshot> = {
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

    const schema = {
      strict: true,
      fields: {
        repository: {
          type: "string",
        },
      },
    };

    paginatedSnapshots = Query.execute(query, paginatedSnapshots, {
      defaultFields: ["repository"],
    });

    return (
      <ContentPanel
        title="Snapshots"
        actions={
          <EuiButton iconType="refresh" onClick={this.getSnapshots} data-test-subj="refreshButton">
            Refresh
          </EuiButton>
        }
      >
        <EuiSearchBar
          defaultQuery={this.initialQuery}
          box={{
            placeholder: "e.g. type:visualization -is:active joe",
            incremental: false,
            schema,
          }}
          onChange={this.onSearchChange}
        />
        <EuiBasicTable
          items={paginatedSnapshots}
          itemId={(item) => `${item.repository}:${item.id}`}
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          onChange={this.onTableChange}
          // noItemsMessage={null}
          // loading={loading}
          // error={error}
          // message={message}
        />
      </ContentPanel>
    );
  }
}
