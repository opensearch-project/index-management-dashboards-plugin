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

import React, { ChangeEvent, Component } from "react";
import { EuiText, EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiLink, EuiIcon } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { DEFAULT_POLICY } from "../../utils/constants";
import { Policy, State } from "../../../../../models/interfaces";
import { PolicyService } from "../../../../services";
import { BREADCRUMBS, DOCUMENTATION_URL } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import PolicyInfo from "../../components/PolicyInfo";
import ErrorNotification from "../../components/ErrorNotification";
import ISMTemplates from "../../components/ISMTemplates";
import States from "../../components/States";
import CreateState from "../CreateState";

interface CreatePolicyProps extends RouteComponentProps {
  isEdit: boolean;
  policyService: PolicyService;
}

interface CreatePolicyState {
  policyId: string;
  policy: Policy;
  policyIdError: string;
  policySeqNo: number | null;
  policyPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  showFlyout: boolean;
  editingState: State | null;
}

export default class CreatePolicy extends Component<CreatePolicyProps, CreatePolicyState> {
  static contextType = CoreServicesContext;
  constructor(props: CreatePolicyProps) {
    super(props);

    this.state = {
      policyId: "",
      policy: DEFAULT_POLICY,
      showFlyout: false,
      editingState: null,

      policySeqNo: null,
      policyPrimaryTerm: null,
      policyIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    if (this.props.isEdit) {
    } else {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, BREADCRUMBS.CREATE_POLICY]);
    }
  };

  onChangePolicyId = (e: ChangeEvent<HTMLInputElement>): void => {
    const policyId = e.target.value;
    this.setState({ policyId });
  };

  // TODO: Can we just have a top level onChangePolicy and the children utilize it to change specific fields?
  onChangePolicyDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    this.setState((state) => ({ policy: { ...state.policy, description } }));
  };

  onChangePolicy = (policy: Policy): void => {
    this.setState({ policy: policy });
  };

  onChangeChannelId = (e: ChangeEvent<HTMLSelectElement>): void => {
    const channelId = e.target.value;
    this.setState((state) => ({
      policy: {
        ...state.policy,
        error_notification: {
          // Either message_template already exists and it will get
          // replaced w/ the spread below or it doesn't and we init it here
          message_template: { source: "" },
          ...state.policy.error_notification,
          channel: {
            channel_id: channelId,
          },
        },
      },
    }));
  };

  onChangeMessage = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const message = e.target.value;
    this.setState((state) => ({
      policy: {
        ...state.policy,
        error_notification: {
          ...state.policy.error_notification,
          message_template: { source: message },
        },
      },
    }));
  };

  onOpenFlyout = (): void => this.setState({ showFlyout: true });
  onCloseFlyout = (): void => this.setState({ showFlyout: false, editingState: null });

  onClickEditState = (state: State) => {
    this.setState({ editingState: state });
    this.onOpenFlyout();
  };

  onClickDeleteState = (idx: number) => {
    this.setState((state) => ({
      policy: {
        ...state.policy,
        states: state.policy.states.slice(0, idx).concat(state.policy.states.slice(idx + 1)),
      },
    }));
  };

  render() {
    const { isEdit } = this.props;
    const { policyId, policy, showFlyout, editingState } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <p>
            Policies let you automatically perform administrative operations on indices.{" "}
            <EuiLink href={DOCUMENTATION_URL} target="_blank">
              Learn more <EuiIcon type="popout" size="s" />
            </EuiLink>
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <PolicyInfo
          policyId={policyId}
          description={policy.description}
          onChangePolicyId={this.onChangePolicyId}
          onChangeDescription={this.onChangePolicyDescription}
        />
        <EuiSpacer size="m" />
        <ErrorNotification
          channelId={policy.error_notification?.channel?.channel_id || ""}
          channelIds={["foo_channel", "bar_channel", "baz_channel"]}
          message={policy.error_notification?.message_template?.source || ""}
          onChangeChannelId={this.onChangeChannelId}
          onChangeMessage={this.onChangePolicyDescription}
        />
        <EuiSpacer size="m" />
        <ISMTemplates policy={policy} onChangePolicy={this.onChangePolicy} />
        <EuiSpacer size="m" />
        <States
          policy={policy}
          onOpenFlyout={this.onOpenFlyout}
          onClickEditState={this.onClickEditState}
          onClickDeleteState={this.onClickDeleteState}
        />
        <EuiSpacer size="m" />

        {/* TODO: Change this to a general CreatePolicyFlyout and have flyout children render different pages */}
        {showFlyout && (
          <CreateState
            state={editingState}
            policy={policy}
            onSaveState={(state: State) => {
              // TODO: Edit vs Create
              this.setState({
                policy: {
                  ...this.state.policy,
                  states: this.state.policy.states.concat(state),
                },
              });
              this.onCloseFlyout();
            }}
            onCloseFlyout={this.onCloseFlyout}
          />
        )}

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton>Cancel</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill>Create</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
