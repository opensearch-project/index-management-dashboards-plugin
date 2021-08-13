/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { Component } from "react";
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiModalFooter,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
  EuiLoadingSpinner,
} from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { PolicyService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import PolicySettings from "../../components/PolicySettings/PolicySettings";
import { ISMTemplate, Policy } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import States from "../../../VisualCreatePolicy/components/States";

interface PolicyDetailsProps extends RouteComponentProps {
  policyService: PolicyService;
}

interface PolicyDetailsState {
  policyId: string;
  isJSONModalOpen: boolean;
  policy: Policy | null;
  isDeleteModalVisible: boolean;
  loading: boolean;
}

export default class PolicyDetails extends Component<PolicyDetailsProps,
  PolicyDetailsState> {
    static contextType = CoreServicesContext;
    constructor(props: PolicyDetailsProps) {
      super(props);

      this.state = {
        policyId: "",
        isJSONModalOpen: false,
        policy: null,
        isDeleteModalVisible: false,
        loading: true,
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

    getPolicy = async (policyId: string): Promise<void> => {
      try {
        const { policyService } = this.props;
        const response = await policyService.getPolicy(policyId);

        if (response.ok) {
          this.setState({
            policy: response.response,
            policyId: response.response.id,
            loading: false,
          });

        } else {
          this.context.notifications.toasts.addDanger(`Could not load the policy: ${response.error}`);
          this.props.history.push(ROUTES.INDEX_POLICIES);
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(`Could not load the policy`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    }

    onEdit = (): void => {
      const { policyId } = this.state;
      if (policyId) this.props.history.push(`${ROUTES.EDIT_POLICY}?id=${policyId}`);
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

    render() {
      const {
        policyId,
        isJSONModalOpen,
        policy,
        isDeleteModalVisible,
        loading
      } = this.state;

      if (loading) {
        return (
          <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: '100px' }}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexGroup>
        );
      }

      // TODO: Needs states section
      // TODO: Edit button needs destination
      return (
        <div style={{ padding: "5px 50px"}}>
          <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="m">
                <h2>{policyId}</h2>
              </EuiTitle>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                    Delete
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton onClick={this.showJSONModal} data-test-subj="viewButton">
                    View JSON
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />
          <PolicySettings
            policyId={policyId}
            channelId={policy.policy.error_notification}
            primaryTerm={policy.primaryTerm}
            lastUpdated={policy.policy.last_updated_time}
            description={policy.policy.description}
            sequenceNumber={policy.seqNo}
            schemaVersion={policy.policy.schema_version}
            ismTemplates={policy.policy.ism_template || []}
            onEdit={this.onEdit}
          />
          <EuiSpacer />
          <States
            onOpenFlyout={() => {}}
            onClickEditState={() => {}}
            policy={policy.policy}
            onClickDeleteState={() => {}}
            isReadOnly={true}
          />

          {isJSONModalOpen && (
            <EuiOverlayMask>
              <EuiModal onClose={this.closeJSONModal} style={{ padding: "5px 30px" }}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>{"View JSON of " + policyId} </EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                  <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                    {JSON.stringify(policy, null, 4)}
                  </EuiCodeBlock>
                </EuiModalBody>

                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeJSONModal}>Close</EuiButtonEmpty>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}

          {isDeleteModalVisible && (
            <DeleteModal policyId={policyId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
          )}
        </div>
      )
    }
  }
