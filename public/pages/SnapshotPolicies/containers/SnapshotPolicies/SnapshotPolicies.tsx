/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _ from "lodash";
import queryString from "query-string";
import { RouteComponentProps } from "react-router-dom";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiEmptyPrompt,
  EuiHealth,
  EuiLink,
  EuiPopover,
  EuiSearchBar,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  EuiTableSortingType,
  EuiText,
  EuiTextColor,
  Pagination,
  Query,
  EuiFlexItem,
  EuiFlexGroup,
  EuiButtonIcon,
  EuiCompressedFieldSearch,
  EuiSmallButton,
} from "@elastic/eui";
import { BREADCRUMBS, PLUGIN_NAME, ROUTES, SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL } from "../../../../utils/constants";
import { getMessagePrompt, getSMPoliciesQueryParamsFromURL, renderTimestampMillis } from "../../helpers";
import { SMPolicy } from "../../../../../models/interfaces";
import { SnapshotManagementService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../../constants";
import { ContentPanel } from "../../../../components/ContentPanel";
import DeleteModal from "../../../PolicyDetails/components/DeleteModal";
import { OnSearchChangeArgs } from "../../../../models/interfaces";
import { humanCronExpression, parseCronExpression } from "../../../CreateSnapshotPolicy/components/CronSchedule/helper";
import { truncateSpan } from "../../../Snapshots/helper";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { ExternalLink } from "../../../utils/display-utils";

interface SnapshotPoliciesProps extends RouteComponentProps, DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotPoliciesState extends DataSourceMenuProperties {
  policies: SMPolicy[];
  totalPolicies: number;
  loadingPolicies: boolean;

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
  useNewUx: boolean;
}

export class SnapshotPolicies extends MDSEnabledComponent<SnapshotPoliciesProps, SnapshotPoliciesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<SMPolicy>[];

  constructor(props: SnapshotPoliciesProps) {
    super(props);

    const { from, size, sortField, sortOrder } = getSMPoliciesQueryParamsFromURL(this.props.location);
    const uiSettings = getUISettings();
    const useNewUx = uiSettings.get("home:useNewHomePage");
    this.state = {
      ...this.state,
      policies: [],
      totalPolicies: 0,
      loadingPolicies: false,
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
      useNewUx: useNewUx,
    };

    this.columns = [
      {
        field: "name",
        name: "Policy name",
        sortable: true,
        dataType: "string",
        render: (name: string, item: SMPolicy) => {
          const showSymbol = _.truncate(name, { length: 60 });
          return (
            <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${name}`)}>
              <span title={name}>{showSymbol}</span>
            </EuiLink>
          );
        },
      },
      {
        field: "enabled",
        name: "Status",
        sortable: true,
        dataType: "boolean",
        width: "100px",
        render: (name: string, item: SMPolicy) => {
          if (item.enabled) {
            return <EuiHealth color="success">Enabled</EuiHealth>;
          } else {
            return <EuiHealth color="danger">Disabled</EuiHealth>;
          }
        },
      },
      {
        field: "snapshot_config.indices",
        name: "Indices",
        sortable: false,
        dataType: "string",
        render: (value: string, item: SMPolicy) => {
          return truncateSpan(value, 60);
        },
      },
      {
        field: "creation.schedule.cron.expression",
        name: "Snapshot schedule",
        sortable: false,
        dataType: "string",
        width: "180px",
        render: (name: string, item: SMPolicy) => {
          const expression = name;
          const timezone = item.creation.schedule.cron.timezone;
          return `${humanCronExpression(parseCronExpression(expression), expression, timezone)}`;
        },
      },
      {
        field: "last_updated_time",
        name: "Time last updated",
        sortable: true,
        dataType: "date",
        width: "150px",
        render: renderTimestampMillis,
      },
      {
        field: "description",
        name: "Description",
        sortable: false,
        dataType: "string",
        width: "150px",
        render: (value: string, item: SMPolicy) => {
          return truncateSpan(value);
        },
      },
    ];
  }

  async componentDidMount() {
    const breadCrumbs = this.state.useNewUx
      ? [BREADCRUMBS.SNAPSHOT_POLICIES]
      : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
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
    this.setState({ loadingPolicies: true });
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
    this.setState({ loadingPolicies: false });
  };

  static getQueryObjectFromState({
    from,
    size,
    sortField,
    sortOrder,
    queryString,
    multiDataSourceEnabled,
    dataSourceId,
  }: SnapshotPoliciesState) {
    return {
      from,
      size,
      sortField,
      sortOrder,
      queryString,
      ...(multiDataSourceEnabled ? { dataSourceId } : {}),
    };
  }

  onSelectionChange = (selectedItems: SMPolicy[]): void => {
    this.setState({ selectedItems });
  };

  onTableChange = (criteria: Criteria<SMPolicy>): void => {
    const { from: prevFrom, size: prevSize, sortField, sortOrder } = this.state;
    const { page: { index, size } = {}, sort: { field, direction } = {} } = criteria;

    // index could be 0, so need to explicitly check if it's undefined
    const from = index !== undefined ? (size ? index * size : prevFrom) : prevFrom;
    this.setState({
      from: from,
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
    _.delay(this.getPolicies, 1000);
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
    _.delay(this.getPolicies, 1000);
  };

  getSelectedPolicyIds = () => {
    return this.state.selectedItems
      .map((item: SMPolicy) => {
        return item.name;
      })
      .join(", ");
  };

  render() {
    const {
      policies,
      totalPolicies,
      loadingPolicies,
      from,
      size,
      sortField,
      sortOrder,
      selectedItems,
      isPopoverOpen,
      isDeleteModalVisible,
    } = this.state;

    const page = Math.floor(from / size);
    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalPolicies,
    };

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
        <EuiTextColor>Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];

    const popoverActionItemsNew = [
      <EuiContextMenuItem
        disabled={!selectedItems.length}
        onClick={() => {
          this.closePopover();
          this.onClickStart();
        }}
      >
        Enable
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        disabled={!selectedItems.length}
        onClick={() => {
          this.closePopover();
          this.onClickStop();
        }}
      >
        Disable
      </EuiContextMenuItem>,
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
        <EuiTextColor>Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];
    const actionsButton = (
      <EuiSmallButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
      >
        Actions
      </EuiSmallButton>
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
        panelPaddingSize="s"
        anchorPosition="downLeft"
        data-test-subj="actionPopover"
      >
        <EuiContextMenuPanel items={popoverActionItems} size="s" />
      </EuiPopover>,
      <EuiButton onClick={this.onClickCreate} fill={true}>
        Create policy
      </EuiButton>,
    ];

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Define an automated snapshot schedule and retention period with a snapshot policy.{" "}
          <EuiLink href={SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

    const promptMessage = (
      <EuiEmptyPrompt
        style={{ maxWidth: "45em" }}
        body={
          <EuiText size="s">
            <p>{getMessagePrompt(loadingPolicies)}</p>
          </EuiText>
        }
        actions={
          <EuiButton onClick={this.onClickCreate} fill={true}>
            Create policy
          </EuiButton>
        }
      />
    );

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppDescriptionControls } = getApplication();

    const descriptionData = [
      {
        renderComponent: (
          <EuiText size="s" color="subdued">
            Define an automated snapshot schedule and retention period with a snapshot policy.{" "}
            <ExternalLink href={SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL} />
          </EuiText>
        ),
      },
    ];

    const controlControlsData = [
      {
        id: "Create policy",
        label: "Create policy",
        iconType: "plus",
        fill: true,
        href: `${PLUGIN_NAME}#${ROUTES.CREATE_SNAPSHOT_POLICY}`,
        testId: "createButton",
        controlType: "button",
      },
    ];

    const searchbar_padding = { padding: "0px 0px 16px 0px" };

    const CommonTable = () => {
      return (
        <EuiBasicTable
          items={policies}
          itemId="name"
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          onChange={this.onTableChange}
          noItemsMessage={promptMessage}
        />
      );
    };

    const CommonModal = () => {
      return (
        isDeleteModalVisible && (
          <DeleteModal policyId={this.getSelectedPolicyIds()} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )
      );
    };

    return !this.state.useNewUx ? (
      <>
        <ContentPanel title="Snapshot policies" actions={actions} subTitleText={subTitleText}>
          <EuiSearchBar
            box={{
              placeholder: "Search snapshot policies",
              incremental: false,
            }}
            onChange={this.onSearchChange}
          />
          {CommonTable()}
        </ContentPanel>
        {CommonModal()}
      </>
    ) : (
      <>
        <HeaderControl setMountPoint={setAppRightControls} controls={controlControlsData} />
        <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />
        <ContentPanel>
          <EuiFlexGroup gutterSize="s" alignItems="center" style={searchbar_padding}>
            <EuiFlexItem grow={true}>
              <EuiCompressedFieldSearch
                autoFocus
                placeholder="Search snapshot policies"
                incremental={false}
                onChange={this.onSearchChange}
                aria-label="Search snapshot policies"
                fullWidth
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon iconType="refresh" onClick={this.getPolicies} aria-label="refresh" size="s" display="base" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                id="action"
                button={actionsButton}
                isOpen={isPopoverOpen}
                closePopover={this.closePopover}
                anchorPosition="downRight"
                panelPaddingSize="s"
              >
                <EuiContextMenuPanel items={popoverActionItemsNew} size="s" />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
          {CommonTable()}
        </ContentPanel>
        {CommonModal()}
      </>
    );
  }
}

export default function (props: Omit<SnapshotPoliciesProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <SnapshotPolicies {...props} {...dataSourceMenuProps} />;
}
