/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import _ from "lodash";
import queryString from "query-string";
import { RouteComponentProps } from "react-router-dom";
import { CoreServicesContext } from "../../../components/core_services";
import {
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButton,
  EuiLink,
  EuiSearchBar,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiTitle,
  Pagination,
  Query,
} from "@elastic/eui";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { getSMPoliciesQueryParamsFromURL } from "../utils/helpers";
import { DocumentSMPolicy, SMPolicy } from "../../../../models/interfaces";
import { SnapshotManagementService } from "../../../services";
import { getErrorMessage } from "../../../utils/helpers";
import { DEFAULT_PAGE_SIZE_OPTIONS, renderTimestampMillis } from "../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";
import { OnSearchChangeArgs } from "../models/interfaces";

interface SMPoliciesProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SMPoliciesState {
  policies: SMPolicy[];
  totalPolicies: number;

  query: Query | null;
  queryText: string;

  from: number;
  size: number;
  sortField: keyof SMPolicy;
  sortDirection: Direction;

  selectedItems: SMPolicy[];

  showFlyout: boolean;
  policyClicked: SMPolicy | null;
}

export default class SMPolicies extends Component<SMPoliciesProps, SMPoliciesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SMPolicy>[];

  constructor(props: SMPoliciesProps) {
    super(props);

    const { from, size, sortField, sortDirection } = getSMPoliciesQueryParamsFromURL(this.props.location);
    this.state = {
      policies: [],
      totalPolicies: 0,
      query: null,
      queryText: "",
      from: from,
      size: size,
      sortField: sortField,
      sortDirection: sortDirection,
      selectedItems: [],
      showFlyout: false,
      policyClicked: null,
    };

    this.columns = [
      {
        field: "name",
        name: "Name",
        sortable: true,
        dataType: "string",
        render: (name: string, item: SMPolicy) => (
          <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${name}`)}>{name}</EuiLink>
        ),
      },
      {
        field: "enabled",
        name: "Status",
        sortable: true,
        dataType: "boolean",
      },
      {
        field: "snapshot_config.indices",
        name: "Indices",
        sortable: false,
        dataType: "string",
      },
      {
        field: "creation.schedule.cron.expression",
        name: "Creation cron",
        sortable: false,
        dataType: "string",
      },
      {
        field: "last_updated_time",
        name: "Last updated time",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
      {
        field: "description",
        name: "Description",
        sortable: true,
        dataType: "string",
      },
    ];
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: SMPoliciesProps, prevState: SMPoliciesState) {
    const prevQuery = SMPolicies.getQueryObjectFromState(prevState);
    const currQuery = SMPolicies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
    }
  }

  static getQueryObjectFromState({ from, size, sortField, sortDirection }: SMPoliciesState) {
    return { from, size, sortField, sortDirection };
  }

  getPolicies = async () => {
    try {
      const { snapshotManagementService, history } = this.props;
      const queryParamsObject = SMPolicies.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryParamsObject);
      history.replace({ ...this.props.location, search: queryParamsString });

      const response = await snapshotManagementService.getPolicies({ ...queryParamsObject });
      if (response.ok) {
        const { policies, totalPolicies } = response.response;
        this.setState({ policies: policies.map((p) => p.policy), totalPolicies });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshot policies."));
    }
  };

  onSelectionChange = (selectedItems: SMPolicy[]): void => {
    this.setState({ selectedItems });
  };

  onTableChange = (criteria: Criteria<SMPolicy>): void => {
    const { from: prevFrom, size: prevSize, sortField, sortDirection } = this.state;
    const { page: { index, size } = {}, sort: { field, direction } = {} } = criteria;

    this.setState({
      from: index ? (size ? index * size : prevFrom) : prevFrom,
      size: size ?? prevSize,
      sortField: field ?? sortField,
      sortDirection: direction ?? sortDirection,
    });
  };

  onClickCreate = () => {
    this.props.history.push(ROUTES.CREATE_SNAPSHOT_POLICY);
  };

  onSearchChange = ({ query, queryText, error }: OnSearchChangeArgs) => {
    if (error) {
      return;
    }

    console.log(`sm dev policies page search change ${queryText}`);

    this.setState({ from: 0, queryText, query });
  };

  render() {
    const { policies, totalPolicies, from, size, sortField, sortDirection, selectedItems } = this.state;

    console.log(`sm dev selectedItems ${JSON.stringify(selectedItems)}`);

    const page = Math.floor(from / size);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalPolicies,
    };

    console.log(`sm dev pagination object ${JSON.stringify(pagination)}`);

    const sorting: EuiTableSortingType<SMPolicy> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<SMPolicy> = {
      onSelectionChange: this.onSelectionChange,
    };

    const actions = [
      <EuiButton iconType="refresh" onClick={this.getPolicies} data-test-subj="refreshButton">
        Refresh
      </EuiButton>,
      <EuiButton onClick={this.onClickCreate} data-test-subj="createPolicyButton">
        Create policy
      </EuiButton>,
    ];

    return (
      <ContentPanel title="Snapshot policies" actions={actions}>
        <EuiSearchBar
          box={{
            placeholder: "e.g. ",
            incremental: false,
          }}
          onChange={this.onSearchChange}
        />
        <EuiBasicTable
          items={policies}
          itemId="name"
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          onChange={this.onTableChange}
          noItemsMessage={null}
        />
      </ContentPanel>
    );
  }
}
