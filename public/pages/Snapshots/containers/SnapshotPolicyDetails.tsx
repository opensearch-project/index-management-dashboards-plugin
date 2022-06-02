/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from "react-router-dom";
import React, { Component } from "react";
import { CoreServicesContext } from "../../../components/core_services";
import { SnapshotManagementService } from "../../../services";
import queryString from "query-string";
import {
  EuiButton,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";
import CustomLabel from "../components/CustomLabel";
import { SMPolicy } from "../../../../models/interfaces";
import { ModalConsumer } from "../../../components/Modal";
import DeleteModal from "../../PolicyDetails/components/DeleteModal";
import { getErrorMessage } from "../../../utils/helpers";

interface SnapshotPolicyDetailsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotPolicyDetailsState {
  policyId: string;
  policy: SMPolicy | null;

  isDeleteModalVisible: boolean;
}

export default class SnapshotPolicyDetails extends Component<SnapshotPolicyDetailsProps, SnapshotPolicyDetailsState> {
  static contextType = CoreServicesContext;

  constructor(props: SnapshotPolicyDetailsProps) {
    super(props);

    this.state = {
      policyId: "",
      policy: null,
      isDeleteModalVisible: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES]);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES, { text: id }]);
      await this.getPolicy(id);
    } else {
      this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  }

  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getPolicy(policyId);
      console.log(`sm dev get policy ${JSON.stringify(response)}`);

      if (response.ok && !!response.response.policy) {
        this.setState({
          policy: response.response.policy,
          policyId: response.response.id,
        });
      } else {
        const errorMessage = response.ok ? "Policy was empty" : response.error;
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${errorMessage}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(`Could not load the policy`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  };

  onEdit = () => {
    const { policyId } = this.state;
    if (policyId) {
      this.props.history.push(`${ROUTES.EDIT_SNAPSHOT_POLICY}?id=${policyId}`);
    }
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  onClickDelete = async (): Promise<void> => {
    const { snapshotManagementService } = this.props;
    const { policyId } = this.state;

    try {
      const response = await snapshotManagementService.deletePolicy(policyId);

      if (response.ok) {
        this.closeDeleteModal();
        this.context.notifications.toasts.addSuccess(`"Policy ${policyId}" successfully deleted`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Could not delete the policy "${policyId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the policy"));
    }
  };

  renderEnabledField = (enabled: boolean) => {
    if (enabled) {
      return "Enabled";
    }
    return "Disabled";
  };

  render() {
    const { policyId, policy, isDeleteModalVisible } = this.state;

    if (!policy) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    console.log(`sm dev enabled field ${policy.enabled}`);
    const policySettingItems = [
      { term: "Policy name", value: policyId },
      { term: "Status", value: this.renderEnabledField(policy.enabled) },
      { term: "Last updated time", value: policy.last_updated_time },
      { term: "Indices", value: policy.snapshot_config.indices },
      { term: "Repository", value: policy.snapshot_config.repository },
      { term: "Description", value: policy.description },
    ];

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
                <EuiButton onClick={this.onEdit}>Edit</EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                  Delete
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <ContentPanel title="Policy settings" titleSize="m">
          <EuiFlexGrid columns={3}>
            {policySettingItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot retention period" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot activities" titleSize="m"></ContentPanel>

        {isDeleteModalVisible && (
          <DeleteModal policyId={policyId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}
