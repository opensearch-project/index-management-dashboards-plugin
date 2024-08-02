/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, useContext } from "react";
import { EuiText, EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiSmallButton, EuiLink, EuiIcon } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { EMPTY_DEFAULT_POLICY } from "../../utils/constants";
import { Policy, State } from "../../../../../models/interfaces";
import { NotificationService, PolicyService } from "../../../../services";
import { BREADCRUMBS, POLICY_DOCUMENTATION_URL, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import PolicyInfo from "../../components/PolicyInfo";
import ISMTemplates from "../../components/ISMTemplates";
import States from "../../components/States";
import CreateState from "../CreateState";
import { getErrorMessage } from "../../../../utils/helpers";
import { getUpdatedPolicy, getUpdatedStates } from "../../utils/helpers";
import ErrorNotification from "../ErrorNotification";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { Data } from "vega";

interface VisualCreatePolicyProps extends RouteComponentProps, DataSourceMenuProperties {
  isEdit: boolean;
  policyService: PolicyService;
  notificationService: NotificationService;
}

interface VisualCreatePolicyState {
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
  errorNotificationJsonString: string;
}

export class VisualCreatePolicy extends Component<VisualCreatePolicyProps, VisualCreatePolicyState> {
  static contextType = CoreServicesContext;
  constructor(props: VisualCreatePolicyProps) {
    super(props);

    this.state = {
      policyId: "",
      policy: EMPTY_DEFAULT_POLICY,
      showFlyout: false,
      editingState: null,

      policySeqNo: null,
      policyPrimaryTerm: null,
      policyIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
      errorNotificationJsonString: "",
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string" && !!id) {
        this.context.chrome.setBreadcrumbs([
          BREADCRUMBS.INDEX_MANAGEMENT,
          BREADCRUMBS.INDEX_POLICIES,
          BREADCRUMBS.EDIT_POLICY,
          { text: id },
        ]);
        await this.getPolicyToEdit(id);
      } else {
        this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    } else {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, BREADCRUMBS.CREATE_POLICY]);
    }
  };

  getPolicyToEdit = async (policyId: string): Promise<void> => {
    try {
      const { policyService } = this.props;
      const response = await policyService.getPolicy(policyId);
      if (response.ok) {
        let errorNotificationJsonString = "";
        // If we have the legacy destination instead of channels, use error notification json string
        if (!!response.response.policy.error_notification?.destination) {
          errorNotificationJsonString = JSON.stringify(response.response.policy.error_notification, null, 4);
        }
        this.setState({
          policySeqNo: response.response.seqNo,
          policyPrimaryTerm: response.response.primaryTerm,
          policyId: response.response.id,
          policy: response.response.policy,
          errorNotificationJsonString,
        });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${response.error}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the policy"));
      this.props.history.push(ROUTES.INDEX_POLICIES);
    }
  };

  onChangePolicyId = (e: ChangeEvent<HTMLInputElement>): void => {
    const policyId = e.target.value;
    if (this.state.hasSubmitted) this.setState({ policyId, policyIdError: policyId ? "" : "Required" });
    else this.setState({ policyId });
  };

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
          message_template: { source: "", lang: "mustache" },
          ...state.policy.error_notification,
          channel: {
            id: channelId,
          },
        },
      },
    }));
  };

  onChangeMessage = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const source = e.target.value;
    this.setState((state) => ({
      policy: {
        ...state.policy,
        error_notification: {
          ...state.policy.error_notification,
          message_template: {
            ...state.policy.error_notification?.message_template,
            source,
          },
        },
      },
    }));
  };

  onChangeErrorNotificationJsonString = (errorNotificationJsonString: string): void => {
    this.setState({ errorNotificationJsonString });
  };

  onSwitchToChannels = () => {
    this.setState((state) => ({ errorNotificationJsonString: "", policy: { ...state.policy, error_notification: null } }));
  };

  onOpenFlyout = (): void => this.setState({ showFlyout: true });
  onCloseFlyout = (): void => this.setState({ showFlyout: false, editingState: null });

  onClickEditState = (state: State) => {
    this.setState({ editingState: state });
    this.onOpenFlyout();
  };

  onClickDeleteState = (idx: number) => {
    const { policy } = this.state;
    // If we deleted the current default state, just fall back to the first state if it exists
    let defaultState = policy.default_state;
    const state = policy.states[idx];
    const states = policy.states.slice(0, idx).concat(policy.states.slice(idx + 1));
    if (policy.default_state === state?.name) {
      defaultState = states[0]?.name || "";
    }
    this.setState((state) => ({
      policy: {
        ...state.policy,
        states,
        default_state: defaultState,
      },
    }));
  };

  onChangeDefaultState = (event: ChangeEvent<HTMLSelectElement>) => {
    const state = event.target.value;
    this.setState({ policy: { ...this.state.policy, default_state: state } });
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.INDEX_POLICIES);
  };

  onCreate = async (policyId: string, policy: Policy): Promise<void> => {
    const { policyService } = this.props;
    try {
      const response = await policyService.putPolicy({ policy: policy }, policyId);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Created policy: ${response.response._id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      } else {
        this.setState({ submitError: response.error, isSubmitting: false });
        this.context.notifications.toasts.addDanger(`Failed to create policy: ${response.error}`);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, "There was a problem creating the policy");
      this.context.notifications.toasts.addDanger(errorMessage);
      this.setState({ submitError: errorMessage, isSubmitting: false });
    }
  };

  onUpdate = async (policyId: string, policy: Policy): Promise<void> => {
    try {
      const { policyService } = this.props;
      const { policyPrimaryTerm, policySeqNo } = this.state;
      if (policySeqNo == null || policyPrimaryTerm == null) {
        this.context.notifications.toasts.addDanger("Could not update policy without seqNo and primaryTerm");
        return;
      }
      const response = await policyService.putPolicy({ policy: policy }, policyId, policySeqNo, policyPrimaryTerm);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Updated policy: ${response.response._id}`);
        this.props.history.push(ROUTES.INDEX_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Failed to update policy: ${response.error}`);
        this.setState({ submitError: response.error, isSubmitting: false });
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, "There was a problem updating the policy");
      this.context.notifications.toasts.addDanger(errorMessage);
      this.setState({ submitError: errorMessage, isSubmitting: false });
    }
  };

  onSubmit = async (): Promise<void> => {
    const { isEdit } = this.props;
    const { policyId, policy, errorNotificationJsonString } = this.state;
    this.setState({ submitError: "", isSubmitting: true, hasSubmitted: true });
    try {
      if (!policyId.trim()) {
        this.setState({ policyIdError: "Required" });
      } else {
        const mergedPolicy = { ...policy };
        if (!!errorNotificationJsonString) {
          // TODO: dont allow submit if invalid json
          mergedPolicy.error_notification = JSON.parse(errorNotificationJsonString);
        }
        if (isEdit) await this.onUpdate(policyId, mergedPolicy);
        else await this.onCreate(policyId, mergedPolicy);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Policy");
      console.error(err);
      this.setState({ isSubmitting: false });
    }
  };

  onSaveState = (state: State, states: State[], order: string, afterBeforeState: string) => {
    const { policy, editingState } = this.state;
    const updatedPolicy = getUpdatedPolicy(policy, state, editingState, states, order, afterBeforeState);
    this.setState({ policy: updatedPolicy });
    this.onCloseFlyout();
  };

  render() {
    const { isEdit, notificationService } = this.props;
    const { policyId, policyIdError, policy, showFlyout, editingState, errorNotificationJsonString } = this.state;
    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="s">
          <p>
            Policies let you automatically perform administrative operations on indices.{" "}
            <EuiLink href={POLICY_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              Learn more
            </EuiLink>
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <PolicyInfo
          isEdit={isEdit}
          policyId={policyId}
          policyIdError={policyIdError}
          description={policy.description}
          onChangePolicyId={this.onChangePolicyId}
          onChangeDescription={this.onChangePolicyDescription}
        />
        <EuiSpacer size="m" />
        <ErrorNotification
          key={this.props.dataSourceId}
          errorNotification={policy.error_notification}
          errorNotificationJsonString={errorNotificationJsonString}
          onChangeChannelId={this.onChangeChannelId}
          onChangeMessage={this.onChangeMessage}
          onChangeErrorNotificationJsonString={this.onChangeErrorNotificationJsonString}
          onSwitchToChannels={this.onSwitchToChannels}
          notificationService={notificationService}
        />
        <EuiSpacer size="m" />
        <ISMTemplates policy={policy} onChangePolicy={this.onChangePolicy} />
        <EuiSpacer size="m" />
        <States
          policy={policy}
          onOpenFlyout={this.onOpenFlyout}
          onClickEditState={this.onClickEditState}
          onClickDeleteState={this.onClickDeleteState}
          onChangeDefaultState={this.onChangeDefaultState}
        />
        <EuiSpacer size="m" />

        {showFlyout && (
          <CreateState state={editingState} policy={policy} onSaveState={this.onSaveState} onCloseFlyout={this.onCloseFlyout} />
        )}

        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButton onClick={this.onCancel}>Cancel</EuiSmallButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButton fill onClick={this.onSubmit}>
              {isEdit ? "Update" : "Create"}
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

export default function (props: Omit<VisualCreatePolicyProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProperties = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <VisualCreatePolicy {...props} {...dataSourceMenuProperties} />;
}
