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
}

export class Policies extends MDSEnabledComponent<PoliciesProps, PoliciesState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<PolicyItem>[];

  constructor(props: PoliciesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(this.props.location);

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
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: PoliciesProps, prevState: PoliciesState) {
    const prevQuery = Policies.getQueryObjectFromState(prevState);
    const currQuery = Policies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
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
      const queryParamsString = queryString.stringify({ ...queryObject, dataSourceLabel: this.state.dataSourceLabel });
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
    if (deleted) await this.getPolicies();
  };

  onClickModalEdit = (item: PolicyItem, onClose: () => void, visual: boolean = false): void => {
    onClose();
    if (!item || !item.id) return;
    this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${item.id}${visual ? "&type=visual" : ""}`);
  };

  render() {
    const { totalPolicies, from, size, search, sortField, sortDirection, selectedItems, policies, loadingPolicies } = this.state;

    const filterIsApplied = !!search;
    const page = Math.floor(from / size);

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

    return (
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
    );
  }
}

export default function (props: Omit<PoliciesProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <Policies {...props} {...dataSourceMenuProps} />;
}
