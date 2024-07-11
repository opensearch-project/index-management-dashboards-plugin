/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useContext } from "react";
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiLoadingSpinner,
  EuiBasicTable,
  EuiTableFieldDataColumnType,
  // @ts-ignore
  Criteria,
  // @ts-ignore
  Pagination,
} from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { PolicyService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import PolicySettings from "../../components/PolicySettings/PolicySettings";
import { DocumentPolicy, ISMTemplate } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import States from "../../../VisualCreatePolicy/components/States";
import JSONModal from "../../../../components/JSONModal";
import { ContentPanel } from "../../../../components/ContentPanel";
import { convertTemplatesToArray } from "../../../VisualCreatePolicy/utils/helpers";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";
import { ModalConsumer } from "../../../../components/Modal";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";

interface PolicyDetailsProps extends RouteComponentProps, DataSourceMenuProperties {
  policyService: PolicyService;
}

interface PolicyDetailsState {
  policyId: string;
  isJSONModalOpen: boolean;
  policy: DocumentPolicy | null;
  isDeleteModalVisible: boolean;
  pageIndex: number;
  pageSize: number;
  showPerPageOptions: boolean;
}

export class PolicyDetails extends Component<PolicyDetailsProps, PolicyDetailsState> {
  static contextType = CoreServicesContext;
  constructor(props: PolicyDetailsProps) {
    super(props);

    this.state = {
      policyId: "",
      isJSONModalOpen: false,
      policy: null,
      isDeleteModalVisible: false,
      pageIndex: 0,
      pageSize: 10,
      showPerPageOptions: true,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, { text: id }]);
      await this.getPolicy(id);
    } else {
      this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
      this.props.history.push(ROUTES.INDEX_POLICIES);
    }
  };

  componentDidUpdate(prevProps: Readonly<PolicyDetailsProps>, prevState: Readonly<PolicyDetailsState>, snapshot?: any): void {
    if (prevProps.dataSourceId !== this.props.dataSourceId) {
      this.setState({
        policyId: "",
        policy: null,
        isJSONModalOpen: false,
        isDeleteModalVisible: false,
        pageIndex: 0,
        pageSize: 10,
        showPerPageOptions: true,
      });
    }
  }
  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { policyService } = this.props;
      const response = await policyService.getPolicy(policyId);

      if (response.ok && !!response.response.policy) {
        this.setState({
          policy: response.response,
          policyId: response.response.id,
        });
      } else {
        const errorMessage = response.ok ? "Policy was empty" : response.error;
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${errorMessage}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(`Could not load the policy`);
      this.props.history.push(ROUTES.INDEX_POLICIES);
    }
  };

  onEdit = (visual: boolean): void => {
    const { policyId } = this.state;
    if (policyId) this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${policyId}${visual ? "&type=visual" : ""}`);
  };

  closeDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  showJSONModal = () => this.setState({ isJSONModalOpen: true });

  closeJSONModal = () => this.setState({ isJSONModalOpen: false });

  onClickDelete = async (): Promise<void> => {
    const { policyService } = this.props;
    const { policyId } = this.state;

    try {
      const response = await policyService.deletePolicy(policyId);

      if (response.ok) {
        this.closeDeleteModal();
        // Show success message
        this.context.notifications.toasts.addSuccess(`"Policy ${policyId}" successfully deleted`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Could not delete the policy "${policyId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the policy"));
    }
  };

  onTableChange = ({ page }: Criteria<ISMTemplate>) => {
    const { index: pageIndex, size: pageSize } = page;

    this.setState({ pageIndex, pageSize });
  };

  render() {
    const { policyId, isJSONModalOpen, policy, isDeleteModalVisible, pageIndex, pageSize, showPerPageOptions } = this.state;

    if (!policy) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    const convertedISMTemplates = convertTemplatesToArray(policy.policy.ism_template);

    const columns: EuiTableFieldDataColumnType<ISMTemplate>[] = [
      {
        field: "index_patterns",
        name: "Index patterns",
        truncateText: false,
      },
      {
        field: "priority",
        name: "Priority",
        truncateText: false,
      },
    ];

    const pagination: Pagination = {
      pageIndex: pageIndex,
      pageSize,
      totalItemCount: convertedISMTemplates.length || 0,
      pageSizeOptions: [10, 20, 50],
      hidePerPageOptions: !showPerPageOptions,
    };

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2>{policyId}</h2>
            </EuiTitle>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <ModalConsumer>
                  {({ onShow }) => (
                    <EuiSmallButton
                      onClick={() => onShow(CreatePolicyModal, { isEdit: true, onClickContinue: this.onEdit })}
                      data-test-subj="policy-details-edit-button"
                    >
                      Edit
                    </EuiSmallButton>
                  )}
                </ModalConsumer>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSmallButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                  Delete
                </EuiSmallButton>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSmallButton onClick={this.showJSONModal} data-test-subj="viewButton">
                  View JSON
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <PolicySettings
          policyId={policyId}
          errorNotification={policy.policy.error_notification}
          primaryTerm={policy.primaryTerm}
          lastUpdated={policy.policy.last_updated_time}
          description={policy.policy.description}
          sequenceNumber={policy.seqNo}
          ismTemplates={policy.policy.ism_template || []}
        />
        <EuiSpacer />
        <ContentPanel bodyStyles={{ padding: "10px" }} title={`ISM Templates (${convertedISMTemplates.length})`} titleSize="s">
          <EuiBasicTable items={convertedISMTemplates} columns={columns} pagination={pagination} onChange={this.onTableChange} />
        </ContentPanel>
        <EuiSpacer />
        <States
          onOpenFlyout={() => {}}
          onChangeDefaultState={() => {}}
          onClickEditState={() => {}}
          policy={policy.policy}
          onClickDeleteState={() => {}}
          isReadOnly={true}
        />

        {isJSONModalOpen && <JSONModal title={"View JSON of " + policyId} json={policy} onClose={this.closeJSONModal} />}

        {isDeleteModalVisible && (
          <DeleteModal policyId={policyId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}

export default function (props: Omit<PolicyDetailsProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <PolicyDetails {...props} {...dataSourceMenuProperties} />;
}
