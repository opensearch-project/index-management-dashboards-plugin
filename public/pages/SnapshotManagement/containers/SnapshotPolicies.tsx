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
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiEmptyPrompt,
  EuiLink,
  EuiPopover,
  EuiSearchBar,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiTextColor,
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
import DeleteModal from "../../PolicyDetails/components/DeleteModal";

interface SnapshotPoliciesProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotPoliciesState {
  policies: SMPolicy[];
  totalPolicies: number;

  query: Query | null;
  queryString: string;

  from: number;
  size: number;
  sortOrder: Direction;
  sortField: keyof SMPolicy;

  selectedItems: SMPolicy[];

  showFlyout: boolean;
  policyClicked: SMPolicy | null;

  isPopoverOpen: boolean;
  isDeleteModalVisible: boolean;
}

export default class SnapshotPolicies extends Component<SnapshotPoliciesProps, SnapshotPoliciesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SMPolicy>[];

  constructor(props: SnapshotPoliciesProps) {
    super(props);

    const { from, size, sortField, sortOrder } = getSMPoliciesQueryParamsFromURL(this.props.location);
    this.state = {
      policies: [],
      totalPolicies: 0,
      query: null,
      queryString: "",
      from: from,
      size: size,
      sortField: sortField,
      sortOrder: sortOrder,
      selectedItems: [],
      showFlyout: false,
      policyClicked: null,
      isPopoverOpen: false,
      isDeleteModalVisible: false,
    };

    this.columns = [
      {
        field: "name",
        name: "Policy name",
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
        render: (name: string, item: SMPolicy) => (item.enabled ? "Enabled" : "Disabled"),
      },
      {
        field: "snapshot_config.indices",
        name: "Indices",
        sortable: false,
        dataType: "string",
      },
      {
        field: "creation.schedule.cron.expression",
        name: "Snapshot schedule",
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
        sortable: false,
        dataType: "string",
      },
    ];
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: SnapshotPoliciesProps, prevState: SnapshotPoliciesState) {
    const prevQuery = SnapshotPolicies.getQueryObjectFromState(prevState);
    const currQuery = SnapshotPolicies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
    }
  }

  getPolicies = async () => {
    try {
      const { snapshotManagementService, history } = this.props;
      const queryParamsObject = SnapshotPolicies.getQueryObjectFromState(this.state);
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

  static getQueryObjectFromState({ from, size, sortField, sortOrder, queryString }: SnapshotPoliciesState) {
    return { from, size, sortField, sortOrder, queryString };
  }

  onSelectionChange = (selectedItems: SMPolicy[]): void => {
    this.setState({ selectedItems });
  };

  onTableChange = (criteria: Criteria<SMPolicy>): void => {
    const { from: prevFrom, size: prevSize, sortField, sortOrder } = this.state;
    const { page: { index, size } = {}, sort: { field, direction } = {} } = criteria;

    this.setState({
      from: index ? (size ? index * size : prevFrom) : prevFrom,
      size: size ?? prevSize,
      sortField: field ?? sortField,
      sortOrder: direction ?? sortOrder,
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

    this.setState({ from: 0, queryString: queryText, query });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  onClickEdit = () => {
    const {
      selectedItems: [{ name }],
    } = this.state;
    if (name) this.props.history.push(`${ROUTES.EDIT_SNAPSHOT_POLICY}?id=${name}`);
  };

  showDeleteModal = () => {
    this.setState({ isDeleteModalVisible: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  onActionButtonClick = () => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  onClickDelete = async () => {
    const { snapshotManagementService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const policyId = item.name;
      try {
        const response = await snapshotManagementService.deletePolicy(policyId);
        if (response.ok) {
          this.context.notifications.toasts.addSuccess(`"${policyId}" successfully deleted!`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not delete policy "${policyId}" :  ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the policy"));
      }
    }
    this.closeDeleteModal();
    await this.getPolicies();
  };

  onClickStart = async () => {
    const { snapshotManagementService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const policyId = item.name;
      try {
        const response = await snapshotManagementService.startPolicy(policyId);
        if (response.ok) {
          this.context.notifications.toasts.addSuccess(`"${policyId}" successfully started!`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not start policy "${policyId}" :  ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not start the policy"));
      }
    }
  };

  onClickStop = async () => {
    const { snapshotManagementService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const policyId = item.name;
      try {
        const response = await snapshotManagementService.stopPolicy(policyId);
        if (response.ok) {
          this.context.notifications.toasts.addSuccess(`"${policyId}" successfully stopped!`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not stop policy "${policyId}" :  ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not stop the policy"));
      }
    }
  };

  getSelectedPolicyIds = () => {
    return this.state.selectedItems
      .map((item: SMPolicy) => {
        return item.name;
      })
      .join(", ");
  };

  render() {
    const { policies, totalPolicies, from, size, sortField, sortOrder, selectedItems, isPopoverOpen, isDeleteModalVisible } = this.state;

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
        direction: sortOrder,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<SMPolicy> = {
      onSelectionChange: this.onSelectionChange,
    };

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
          this.showDeleteModal();
        }}
      >
        <EuiTextColor color="danger">Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];

    const actionsButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
      >
        Actions
      </EuiButton>
    );

    const actions = [
      <EuiButton iconType="refresh" onClick={this.getPolicies} data-test-subj="refreshButton">
        Refresh
      </EuiButton>,
      <EuiButton disabled={!selectedItems.length} onClick={this.onClickStop}>
        Disable
      </EuiButton>,
      <EuiButton disabled={!selectedItems.length} onClick={this.onClickStart}>
        Enable
      </EuiButton>,
      <EuiPopover
        id="action"
        button={actionsButton}
        isOpen={isPopoverOpen}
        closePopover={this.closePopover}
        panelPaddingSize="none"
        anchorPosition="downLeft"
        data-test-subj="actionPopover"
      >
        <EuiContextMenuPanel items={popoverActionItems} />
      </EuiPopover>,
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Create policy
      </EuiButton>,
    ];

    return (
      <>
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
            noItemsMessage={<EuiEmptyPrompt title={<h5>No snapshot policy found</h5>} body="There are no snapshot policy." />}
          />
        </ContentPanel>

        {isDeleteModalVisible && (
          <DeleteModal policyId={this.getSelectedPolicyIds()} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </>
    );
  }
}
