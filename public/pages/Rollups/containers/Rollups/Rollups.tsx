/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import _ from "lodash";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import queryString from "query-string";
import { getErrorMessage } from "../../../../utils/helpers";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../../Indices/utils/constants";
import { RouteComponentProps } from "react-router-dom";
import {
  EuiBasicTable,
  EuiHorizontalRule,
  // @ts-ignore
  Criteria,
  EuiTableSortingType,
  Direction,
  // @ts-ignore
  Pagination,
  EuiTableSelectionType,
  EuiFlexItem,
  EuiFieldSearch,
  EuiPagination,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiButton,
  EuiPopover,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiTextColor,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiInMemoryTable,
  EuiButtonIcon,
  EuiCompressedFieldSearch,
} from "@elastic/eui";
import { RollupService } from "../../../../services";
import RollupEmptyPrompt from "../../components/RollupEmptyPrompt";
import { RollupQueryParams } from "../../models/interfaces";
import { getURLQueryParams, renderContinuous, renderEnabled, renderTime } from "../../utils/helpers";
import DeleteModal from "../../components/DeleteModal";
import { renderStatus } from "../../../RollupDetails/utils/helpers";
import { DocumentRollup } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { HttpFetchQuery } from "opensearch-dashboards/public";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { ContentPanel } from "../../../../components/ContentPanel";

interface RollupsProps extends RouteComponentProps, DataSourceMenuProperties {
  rollupService: RollupService;
}

interface RollupsState extends DataSourceMenuProperties {
  totalRollups: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof DocumentRollup;
  sortDirection: Direction;
  selectedItems: DocumentRollup[];
  rollups: DocumentRollup[];
  rollupExplain: any;
  loadingRollups: boolean;
  isPopoverOpen: boolean;
  isDeleteModalVisible: boolean;
  useNewUX: boolean;
}

export class Rollups extends MDSEnabledComponent<RollupsProps, RollupsState> {
  static contextType = CoreServicesContext;
  constructor(props: RollupsProps) {
    super(props);

    const uiSettings = getUISettings();
    const useNewUX = uiSettings.get("home:useNewHomePage");
    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    this.state = {
      ...this.state,
      totalRollups: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      rollups: [],
      loadingRollups: true,
      isPopoverOpen: false,
      isDeleteModalVisible: false,
      rollupExplain: {},
      useNewUX: useNewUX,
    };

    this.getRollups = _.debounce(this.getRollups, 500, { leading: true });
  }

  async componentDidMount() {
    const breadCrumbs = this.state.useNewUX ? [BREADCRUMBS.ROLLUPS] : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    await this.getRollups();
  }

  async componentDidUpdate(prevProps: RollupsProps, prevState: RollupsState) {
    const prevQuery = Rollups.getQueryObjectFromState(prevState);
    const currQuery = Rollups.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getRollups();
    }
  }

  static getQueryObjectFromState({
    from,
    size,
    search,
    sortField,
    sortDirection,
    dataSourceId,
    multiDataSourceEnabled,
  }: RollupsState): RollupQueryParams {
    return { from, size, search, sortField, sortDirection, ...(multiDataSourceEnabled ? { dataSourceId } : {}) };
  }

  getRollups = async (): Promise<void> => {
    this.setState({ loadingRollups: true });
    try {
      const { rollupService, history } = this.props;
      const queryObject = Rollups.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const rollupJobsResponse = await rollupService.getRollups(queryObject);
      if (rollupJobsResponse.ok) {
        const { rollups, totalRollups, metadata } = rollupJobsResponse.response;
        this.setState({ rollups, totalRollups, rollupExplain: metadata });
      } else {
        this.context.notifications.toasts.addDanger(rollupJobsResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the rollups"));
    }
    this.setState({ loadingRollups: false });
  };

  onClickCreate = (): void => {
    this.props.history.push(ROUTES.CREATE_ROLLUP);
  };

  onClickEdit = (): void => {
    const {
      selectedItems: [{ _id }],
    } = this.state;
    if (_id) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${_id}`);
  };

  onClickDelete = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.deleteRollup(rollupId);

        if (response.ok) {
          this.closeDeleteModal();
          //Show success message
          this.context.notifications.toasts.addSuccess(`"${rollupId}" successfully deleted!`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not delete the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the rollup job"));
      }
    }
    await this.getRollups();
  };

  onDisable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.stopRollup(rollupId);

        if (response.ok) {
          //Show success message
          this.context.notifications.toasts.addSuccess(`${rollupId} is disabled`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not stop the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not stop the rollup job"));
      }
    }
    await this.getRollups();
  };

  onEnable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { selectedItems } = this.state;
    for (let item of selectedItems) {
      const rollupId = item._id;
      try {
        const response = await rollupService.startRollup(rollupId);

        if (response.ok) {
          //Show success message
          this.context.notifications.toasts.addSuccess(`${rollupId} is enabled`);
        } else {
          this.context.notifications.toasts.addDanger(`Could not start the rollup job "${rollupId}" : ${response.error}`);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not start the rollup job"));
      }
    }
    await this.getRollups();
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<ManagedCatIndex>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: DocumentRollup[]): void => {
    this.setState({ selectedItems });
  };

  onSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ from: 0, search: e.target.value });
  };

  onPageClick = (page: number): void => {
    const { size } = this.state;
    this.setState({ from: page * size });
  };

  resetFilters = (): void => {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  };

  onActionButtonClick = (): void => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  closePopover = (): void => {
    this.setState({ isPopoverOpen: false });
  };

  closeDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  getSelectedRollupIds = (): string =>
    this.state.selectedItems
      .map((item) => {
        return item._id;
      })
      .join(", ");

  render() {
    const {
      totalRollups,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      rollups,
      loadingRollups,
      isPopoverOpen,
      isDeleteModalVisible,
      useNewUX,
    } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);
    const pageCount = Math.ceil(totalRollups / size) || 1;

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalRollups || 0,
    };

    const sorting: EuiTableSortingType<DocumentRollup> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const actionButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
        size={useNewUX ? "s" : undefined}
      >
        Actions
      </EuiButton>
    );

    const selection: EuiTableSelectionType<DocumentRollup> = {
      onSelectionChange: this.onSelectionChange,
    };

    const actionItems = [
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

    const newActionItems = [
      <EuiContextMenuItem
        disabled={!selectedItems.length}
        onClick={() => {
          this.onEnable();
        }}
        data-test-subj="enableButton"
      >
        Enable
      </EuiContextMenuItem>,
      <EuiContextMenuItem disabled={!selectedItems.length} onClick={this.onDisable} data-test-subj="disableButton">
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

    const rollupsColumns: EuiTableFieldDataColumnType<DocumentRollup>[] = [
      {
        field: "_id",
        name: "Name",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: (_id) => (
          <EuiLink onClick={() => this.props.history.push(`${ROUTES.ROLLUP_DETAILS}?id=${_id}`)} data-test-subj={`rollupLink_${_id}`}>
            {_id}
          </EuiLink>
        ),
      },
      {
        field: "rollup.source_index",
        name: "Source index",
        sortable: true,
        textOnly: true,
        truncateText: true,
      },
      {
        field: "rollup.target_index",
        name: "Target index",
        sortable: true,
        textOnly: true,
        truncateText: true,
      },
      {
        field: "rollup.enabled",
        name: "Job state",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: renderEnabled,
      },
      {
        field: "rollup.continuous",
        name: "Continuous",
        sortable: true,
        textOnly: true,
        truncateText: true,
        render: renderContinuous,
      },
      {
        field: "metadata.rollup_metadata.continuous",
        name: "Next rollup window",
        sortable: false,
        textOnly: true,
        render: (metadata) =>
          metadata == null ? "-" : renderTime(metadata.next_window_start_time) + " - " + renderTime(metadata.next_window_end_time),
      },
      {
        field: "metadata",
        name: "Rollup job status",
        sortable: false,
        textOnly: true,
        render: (metadata) => renderStatus(metadata),
      },
    ];

    const commonTable = () => {
      return (
        <EuiBasicTable
          columns={rollupsColumns}
          isSelectable={true}
          itemId="_id"
          items={rollups}
          noItemsMessage={<RollupEmptyPrompt filterIsApplied={filterIsApplied} loading={loadingRollups} resetFilters={this.resetFilters} />}
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
          tableLayout="auto"
        />
      );
    };

    const commonDeleteModal = () => {
      return (
        isDeleteModalVisible && (
          <DeleteModal rollupId={this.getSelectedRollupIds()} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )
      );
    };

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls } = getApplication();
    const controlControlsData = [
      {
        id: "Create rollup job",
        label: "Create rollup job",
        fill: true,
        run: this.onClickCreate,
        testId: "createRollupButton",
        controlType: "button",
      },
    ];

    const searchbar_padding = { padding: "0px 0px 16px 0px" };

    return useNewUX ? (
      <>
        <HeaderControl setMountPoint={setAppRightControls} controls={controlControlsData} />
        <ContentPanel>
          <EuiFlexGroup gutterSize="s" alignItems="center" style={searchbar_padding}>
            <EuiFlexItem grow={true}>
              <EuiCompressedFieldSearch
                autoFocus
                incremental={true}
                fullWidth={true}
                value={search}
                placeholder="Search"
                aria-label="Search"
                onChange={this.onSearchChange}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="refresh"
                onClick={this.getRollups}
                aria-label="refresh"
                size="s"
                display="base"
                data-test-subj="refreshButton"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                id="action"
                button={actionButton}
                isOpen={isPopoverOpen}
                closePopover={this.closePopover}
                panelPaddingSize="s"
                anchorPosition="downLeft"
                data-test-subj="actionPopover"
              >
                <EuiContextMenuPanel items={newActionItems} size="s" />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
          {commonTable()}
          {commonDeleteModal()}
        </ContentPanel>
      </>
    ) : (
      <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="m">
              <h3>{"Rollup jobs (" + `${rollups.length}` + ")"}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton iconType="refresh" onClick={this.getRollups} data-test-subj="refreshButton">
                  Refresh
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton disabled={!selectedItems.length} onClick={this.onDisable} data-test-subj="disableButton">
                  Disable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  disabled={!selectedItems.length}
                  onClick={() => {
                    this.onEnable();
                  }}
                  data-test-subj="enableButton"
                >
                  Enable
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  id="action"
                  button={actionButton}
                  isOpen={isPopoverOpen}
                  closePopover={this.closePopover}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                  data-test-subj="actionPopover"
                >
                  <EuiContextMenuPanel items={actionItems} />
                </EuiPopover>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.onClickCreate} fill={true} data-test-subj="createRollupButton">
                  Create rollup job
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <div style={{ padding: "initial" }}>
          <EuiFlexGroup style={{ padding: "0px 5px" }}>
            <EuiFlexItem>
              <EuiFieldSearch fullWidth={true} value={search} placeholder="Search" onChange={this.onSearchChange} />
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiHorizontalRule margin="xs" />

          {commonTable()}
          {commonDeleteModal()}
        </div>
      </EuiPanel>
    );
  }
}

export default function (props: Omit<RollupsProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <Rollups {...props} {...dataSourceMenuProps} />;
}
