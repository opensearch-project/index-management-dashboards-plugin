/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import {
  EuiBasicTable,
  EuiHorizontalRule,
  EuiTableFieldDataColumnType,
  EuiLink,
  // @ts-ignore
  Criteria,
  EuiTableSortingType,
  Direction,
  // @ts-ignore
  Pagination,
  EuiTableSelectionType,
  EuiButton,
  EuiContextMenuItem,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFieldSearch,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenu,
  EuiIcon,
} from "@elastic/eui";
import _ from "lodash";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import PolicyControls from "../../components/PolicyControls";
import PolicyEmptyPrompt from "../../components/PolicyEmptyPrompt";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";
import PolicyModal from "../../../../components/PolicyModal";
import { ModalConsumer } from "../../../../components/Modal";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import { PoliciesQueryParams, PolicyItem } from "../../models/interfaces";
import { getURLQueryParams, renderTime } from "../../utils/helpers";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { PolicyService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { CoreServicesContext } from "../../../../components/core_services";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { DataSource } from "src/plugins/data/public";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlButtonData, TopNavControlTextData } from "src/plugins/navigation/public";

interface PoliciesProps extends RouteComponentProps, DataSourceMenuProperties {
  policyService: PolicyService;
}

interface PoliciesState extends DataSourceMenuProperties {
  totalPolicies: number;
  from: number;
  size: number;
  search: string;
  sortField: keyof PolicyItem;
  sortDirection: Direction;
  selectedItems: PolicyItem[];
  policies: PolicyItem[];
  loadingPolicies: boolean;
  useNewUX: boolean;
  showCreatePolicyModal: boolean;
  showDeleteModal: boolean;
  showEditModal: boolean;
  isPopoverOpen: boolean;
}

export class Policies extends MDSEnabledComponent<PoliciesProps, PoliciesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<PolicyItem>[];

  constructor(props: PoliciesProps) {
    super(props);
    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

    const uiSettings = getUISettings();
    const useNewUx = uiSettings.get("home:useNewHomePage");

    this.state = {
      ...this.state,
      totalPolicies: 0,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      policies: [],
      loadingPolicies: true,
      useNewUX: useNewUx,
      showCreatePolicyModal: false,
      showDeleteModal: false,
      showEditModal: false,
      isPopoverOpen: false,
    };

    this.getPolicies = _.debounce(this.getPolicies, 500, { leading: true });

    this.columns = [
      {
        field: "id",
        name: "Policy",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
        render: (name: string, item: PolicyItem) => (
          <EuiLink onClick={() => this.props.history.push(`${ROUTES.POLICY_DETAILS}?id=${name}`)} data-test-subj={`policyLink_${name}`}>
            {name}
          </EuiLink>
        ),
      },
      {
        field: "policy.description",
        name: "Description",
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: "150px",
      },
      {
        field: "policy.last_updated_time",
        name: "Last updated time",
        sortable: true,
        truncateText: false,
        render: renderTime,
        dataType: "date",
        width: "150px",
      },
    ];
  }

  async componentDidMount() {
    const breadCrumbs = this.state.useNewUX ? [BREADCRUMBS.INDEX_POLICIES_NEW] : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    await this.getPolicies();
    if (this.state.useNewUX) {
      this.context.chrome.setBreadcrumbs([
        { text: BREADCRUMBS.INDEX_POLICIES_NEW.text.concat(` (${this.state.totalPolicies})`), href: BREADCRUMBS.INDEX_POLICIES_NEW.href },
      ]);
    }
  }

  async componentDidUpdate(prevProps: PoliciesProps, prevState: PoliciesState) {
    const prevQuery = Policies.getQueryObjectFromState(prevState);
    const currQuery = Policies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
      if (this.state.useNewUX) {
        this.context.chrome.setBreadcrumbs([
          { text: BREADCRUMBS.INDEX_POLICIES_NEW.text.concat(` (${this.state.totalPolicies})`), href: BREADCRUMBS.INDEX_POLICIES_NEW.href },
        ]);
      }
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
  }: PoliciesState): PoliciesQueryParams {
    return { from, size, search, sortField, sortDirection, ...(multiDataSourceEnabled ? { dataSourceId } : {}) };
  }

  getPolicies = async (): Promise<void> => {
    this.setState({ loadingPolicies: true });
    try {
      const { policyService, history } = this.props;
      const queryObject = Policies.getQueryObjectFromState(this.state);
      const queryParamsString = queryString.stringify(queryObject);
      history.replace({ ...this.props.location, search: queryParamsString });
      const getPoliciesResponse = await policyService.getPolicies(queryObject);
      if (getPoliciesResponse.ok) {
        const {
          response: { policies, totalPolicies },
        } = getPoliciesResponse;
        this.setState({ policies, totalPolicies });
      } else {
        this.context.notifications.toasts.addDanger(getPoliciesResponse.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the policies"));
    }
    this.setState({ loadingPolicies: false });
    if (this.state.useNewUX) {
      this.context.chrome.setBreadcrumbs([
        { text: BREADCRUMBS.INDEX_POLICIES_NEW.text.concat(` (${this.state.totalPolicies})`), href: BREADCRUMBS.INDEX_POLICIES_NEW.href },
      ]);
    }
  };

  deletePolicy = async (policyId: string): Promise<boolean> => {
    const { policyService } = this.props;
    try {
      const deletePolicyResponse = await policyService.deletePolicy(policyId);
      if (deletePolicyResponse.ok) {
        this.context.notifications.toasts.addSuccess(`Deleted the policy: ${policyId}`);
        return true;
      } else {
        this.context.notifications.toasts.addDanger(`Failed to delete the policy, ${deletePolicyResponse.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem deleting the policy"));
    }
    return false;
  };

  onTableChange = ({ page: tablePage, sort }: Criteria<PolicyItem>): void => {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ from: page * size, size, sortField, sortDirection });
  };

  onSelectionChange = (selectedItems: PolicyItem[]): void => {
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

  onClickEdit = (visual: boolean): void => {
    const {
      selectedItems: [{ id }],
    } = this.state;
    if (id) this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${id}${visual ? "&type=visual" : ""}`);
  };

  onClickCreate = (visual: boolean): void => {
    this.props.history.push(`${ROUTES.CREATE_POLICY}${visual ? "?type=visual" : ""}`);
  };

  onClickDelete = async (policyIds: string[]): Promise<void> => {
    if (!policyIds.length) return;

    const deletePromises = policyIds.map((policyId) => this.deletePolicy(policyId));

    const deleted = (await Promise.all(deletePromises)).reduce((deleted: boolean, result: boolean) => deleted && result);
    if (deleted) {
      await this.getPolicies();
      if (this.state.useNewUX) {
        this.context.chrome.setBreadcrumbs([
          { text: BREADCRUMBS.INDEX_POLICIES_NEW.text.concat(` (${this.state.totalPolicies})`), href: BREADCRUMBS.INDEX_POLICIES_NEW.href },
        ]);
      }
    }
  };

  onClickModalEdit = (item: PolicyItem, onClose: () => void, visual: boolean = false): void => {
    onClose();
    if (!item || !item.id) return;
    this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${item.id}${visual ? "&type=visual" : ""}`);
  };

  onShowCreatePolicyModal = (): void => {
    this.setState({ showCreatePolicyModal: true });
  };

  onCloseCreatePolicyModal = (): void => {
    this.setState({ showCreatePolicyModal: false });
  };

  onShowDeleteModal = () => {
    this.setState({ showDeleteModal: true });
  };

  onCloseDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  };

  onShowEditModal = () => {
    this.setState({ showEditModal: true });
  };

  onCloseEditModal = () => {
    this.setState({ showEditModal: false });
  };

  closePopover = () => {
    this.setState({ isPopoverOpen: false });
  };

  onActionButtonClick = () => {
    this.setState({ isPopoverOpen: !this.state.isPopoverOpen });
  };

  render() {
    const {
      totalPolicies,
      from,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      policies,
      loadingPolicies,
      useNewUX,
      showCreatePolicyModal,
      showDeleteModal,
      showEditModal,
      isPopoverOpen,
    } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);
    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppBadgeControls } = getApplication();

    const pagination: Pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: totalPolicies,
    };

    const sorting: EuiTableSortingType<PolicyItem> = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection: EuiTableSelectionType<PolicyItem> = {
      onSelectionChange: this.onSelectionChange,
    };

    const actions = [
      {
        text: "Delete",
        buttonProps: { disabled: !selectedItems.length },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(ConfirmationModal, {
              title: `Delete ${selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`}`,
              bodyMessage: `Delete ${
                selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`
              } permanently? This action cannot be undone.`,
              actionMessage: "Delete",
              onAction: () => this.onClickDelete(selectedItems.map((item) => item.id)),
            }),
        },
      },
      {
        text: "Edit",
        buttonProps: {
          disabled: selectedItems.length !== 1,
          onClick: this.onClickEdit,
        },
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(CreatePolicyModal, { isEdit: true, onClickContinue: this.onClickEdit }),
        },
      },
      {
        text: "Create policy",
        modal: {
          onClickModal: (onShow: (component: any, props: object) => void) => () =>
            onShow(CreatePolicyModal, { onClickContinue: this.onClickCreate }),
        },
      },
    ];

    const CommonTable = () => {
      return (
        <EuiBasicTable
          items={policies}
          itemId="id"
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
          isSelectable={true}
          selection={selection}
          onChange={this.onTableChange}
          noItemsMessage={
            <PolicyEmptyPrompt
              history={this.props.history}
              filterIsApplied={filterIsApplied}
              loading={loadingPolicies}
              resetFilters={this.resetFilters}
            />
          }
        />
      );
    };

    const CreateModal = () => {
      return (
        showCreatePolicyModal && (
          <CreatePolicyModal isEdit={false} onClose={this.onCloseCreatePolicyModal} onClickContinue={this.onClickCreate} />
        )
      );
    };

    const EditModal = () => {
      return showEditModal && <CreatePolicyModal isEdit={true} onClose={this.onCloseEditModal} onClickContinue={this.onClickEdit} />;
    };

    const DeleteModal = () => {
      return (
        showDeleteModal && (
          <ConfirmationModal
            title={`Delete ${selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`}`}
            bodyMessage={`Delete ${
              selectedItems.length === 1 ? selectedItems[0].id : `${selectedItems.length} policies`
            } permanently? This action cannot be undone.`}
            actionMessage={"Delete"}
            onAction={() => this.onClickDelete(selectedItems.map((item) => item.id))}
            onClose={this.onCloseDeleteModal}
          />
        )
      );
    };

    const actionsButton = (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        disabled={!selectedItems.length}
        onClick={this.onActionButtonClick}
        data-test-subj="actionButton"
        size="s"
      >
        Actions
      </EuiButton>
    );

    const popoverItems = [
      {
        id: 0,
        width: 159,
        items: [
          {
            name: "Edit",
            icon: "pencil",
            disabled: selectedItems.length != 1,
            onClick: () => {
              this.closePopover();
              this.onShowEditModal();
            },
          },
          {
            name: "Delete",
            icon: <EuiIcon type="trash" size="m" color="danger" />,
            disabled: !selectedItems.length,
            onClick: () => {
              this.closePopover();
              this.onShowDeleteModal();
            },
          },
        ],
      },
    ];

    return !useNewUX ? (
      <ContentPanel
        actions={<ContentPanelActions actions={actions} />}
        bodyStyles={{ padding: "initial" }}
        title="State management policies"
        itemCount={totalPolicies}
      >
        <PolicyControls
          activePage={page}
          pageCount={Math.ceil(totalPolicies / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getPolicies}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId="id"
          items={policies}
          noItemsMessage={
            <PolicyEmptyPrompt
              history={this.props.history}
              filterIsApplied={filterIsApplied}
              loading={loadingPolicies}
              resetFilters={this.resetFilters}
            />
          }
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />
      </ContentPanel>
    ) : (
      <>
        <HeaderControl
          setMountPoint={setAppRightControls}
          controls={[
            {
              id: "Create policy",
              label: "Create policy",
              iconType: "plus",
              fill: true,
              testId: "createButton",
              controlType: "button",
              run: this.onShowCreatePolicyModal,
            } as TopNavControlButtonData,
          ]}
        />
        <ContentPanel>
          <EuiFlexGroup gutterSize="s" alignItems="center" style={{ padding: "0px 0px 16px 0px" }}>
            <EuiFlexItem grow={true}>
              <EuiCompressedFieldSearch
                autoFocus
                placeholder={search}
                incremental={false}
                onChange={this.onSearchChange}
                aria-label={search}
                fullWidth
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                id="action"
                button={actionsButton}
                isOpen={isPopoverOpen}
                closePopover={this.closePopover}
                anchorPosition="downRight"
                panelPaddingSize="none"
              >
                <EuiContextMenu initialPanelId={0} panels={popoverItems} size="s" />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
          {CommonTable()}
        </ContentPanel>
        {CreateModal()}
        {DeleteModal()}
        {EditModal()}
      </>
    );
  }
}

export default function (props: Omit<PoliciesProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <Policies {...props} {...dataSourceMenuProps} />;
}
