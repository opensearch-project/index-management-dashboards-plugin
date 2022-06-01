/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from "react-router-dom";
import React, { Component } from "react";
import { CoreServicesContext } from "../../../components/core_services";
import { SnapshotManagementService } from "../../../services";
import queryString from "query-string";
import { EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiLoadingSpinner, EuiSpacer, EuiTitle } from "@elastic/eui";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";
import CustomLabel from "../components/CustomLabel";
import { SMPolicy } from "../../../../models/interfaces";
import { ModalConsumer } from "../../../components/Modal";

interface SMPolicyDetailsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SMPolicyDetailsState {
  policyId: string;
  policy: SMPolicy | null;
}

export default class SMPolicyDetails extends Component<SMPolicyDetailsProps, SMPolicyDetailsState> {
  static contextType = CoreServicesContext;

  constructor(props: SMPolicyDetailsProps) {
    super(props);

    this.state = {
      policyId: "",
      policy: null,
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
      console.log(`sm dev get policy ${response}`);

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

  render() {
    const { policyId, policy } = this.state;

    if (!policy) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    return (
      <div>
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
              {/* <EuiFlexItem grow={false}>
                <EuiButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                  Delete
                </EuiButton>
              </EuiFlexItem> */}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />

        <ContentPanel title="Policy settings" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot retention period" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m"></ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot activities" titleSize="m"></ContentPanel>
      </div>
    );
  }
}
