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
} from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { PolicyService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import PolicySettings from "../../components/PolicySettings/PolicySettings";
import { ISMTemplate } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import States from "../../../VisualCreatePolicy/components/States";

interface PolicyDetailsProps extends RouteComponentProps {
  policyService: PolicyService;
}

interface PolicyDetailsState {
  policyId: string;
  channelId: string;
  primaryTerm: number;
  lastUpdated: string;
  description: string;
  sequenceNumber: number;
  schemaVersion: number;
  ismTemplates: ISMTemplate[];

  isJSONModalOpen: boolean;
  policyJSON: any;
  isDeleteModalVisible: boolean;
}

export default class PolicyDetails extends Component<PolicyDetailsProps,
  PolicyDetailsState> {
    static contextType = CoreServicesContext;
    constructor(props: PolicyDetailsProps) {
      super(props);

      this.state = {
        policyId: "",
        channelId: "",
        primaryTerm: -1,
        lastUpdated: "",
        description: "",
        sequenceNumber: -1,
        schemaVersion: -1,
        ismTemplates: [],

        isJSONModalOpen: false,
        policyJSON: {policy:{states:[]}},
        isDeleteModalVisible: false,
      };
    }

    componentDidMount = async (): Promise<void> => {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string") {
        this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, { text: id }]);
        this.props.history.push(`${ROUTES.POLICY_DETAILS}?id=${id}`);
        console.log("Getting policy!");
        await this.getPolicy(id);
        this.forceUpdate();
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
          console.log("Response: ", response.response);
          this.setState({
            policyId: response.response.id,
            channelId: response.response.policy.error_notification,
            primaryTerm: response.response.primaryTerm,
            lastUpdated: response.response.policy.last_updated_time,
            policyJSON: response.response,
            description: response.response.policy.description,
            sequenceNumber: response.response.seqNo,
            schemaVersion: response.response.policy.schema_version,
          })
          if (response.response.policy.ism_template) {
            this.setState({ismTemplates: response.response.policy.ism_template,});
          }
        }
      } catch (err) {
        this.context.notifications.toasts.addDanger(getErrorMessage(err, "Somethin' happened"));
      }
    }

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
        channelId,
        primaryTerm,
        lastUpdated,
        description,
        sequenceNumber,
        schemaVersion,
        ismTemplates,
        isJSONModalOpen,
        policyJSON,
        isDeleteModalVisible,
      } = this.state;

      console.log(this.props, this.state);

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
            channelId={channelId}
            primaryTerm={primaryTerm}
            lastUpdated={lastUpdated}
            description={description}
            sequenceNumber={sequenceNumber}
            schemaVersion={schemaVersion}
            ismTemplates={ismTemplates}
          />
          <EuiSpacer />
          <States
            onOpenFlyout={() => {}}
            onClickEditState={() => {}}
            policy={policyJSON.policy}
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
                    {JSON.stringify(policyJSON, null, 4)}
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
