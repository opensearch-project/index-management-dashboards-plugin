/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import queryString from "query-string";
import {
  EuiFormRow,
  EuiTextArea,
  EuiSelect,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSwitchEvent,
  EuiTitle,
  EuiButtonEmpty,
  EuiButton,
} from "@elastic/eui";
import React, { ChangeEvent, Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ContentPanel } from "../../../components/ContentPanel";
import { DEFAULT_DELETE_CONDITION, DEFAULT_SM_POLICY } from "../utils/constants";
import moment from "moment-timezone";
import CustomLabel from "../components/CustomLabel";
import ToggleWrapper from "../components/ToggleWrapper";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { CoreServicesContext } from "../../../components/core_services";
import { getErrorMessage } from "../../../utils/helpers";
import { SnapshotManagementService } from "../../../services";
import { SMPolicy } from "../../../../models/interfaces";

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

interface CreateSMPolicyProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
  isEdit: boolean;
}

interface CreateSMPolicyState {
  // name: string;
  // description: string;
  // creationExpression: string;
  // deletionExpression: string;
  // timezone: string;

  // indices: string;
  // repository: string;
  // includeGlobalState: boolean;
  // ignoreUnavailable: boolean;
  // partial: boolean;

  // maxCount: number;
  // maxAge: string;
  // minCount: number;

  policy: SMPolicy;
  policyId: string;

  isSubmitting: boolean;
}

export default class CreateSMPolicy extends Component<CreateSMPolicyProps, CreateSMPolicyState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateSMPolicyProps) {
    super(props);

    this.state = {
      // name: "",
      // description: "",
      // creationExpression: DEFAULT_SM_POLICY.creation.schedule.cron.expression,
      // deletionExpression: DEFAULT_SM_POLICY.deletion.schedule.cron.expression,
      // timezone: DEFAULT_SM_POLICY.creation.schedule.cron.timezone,

      // indices: DEFAULT_SM_POLICY.snapshot_config.indices,
      // repository: DEFAULT_SM_POLICY.snapshot_config.repository,
      // includeGlobalState: false,
      // ignoreUnavailable: false,
      // partial: false,

      // maxCount: DEFAULT_DELETE_CONDITION.max_count,
      // maxAge: DEFAULT_DELETE_CONDITION.max_age,
      // minCount: DEFAULT_DELETE_CONDITION.min_count,

      policy: DEFAULT_SM_POLICY,
      policyId: "",

      isSubmitting: false,
    };
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string" && !!id) {
        this.context.chrome.setBreadcrumbs([
          BREADCRUMBS.SNAPSHOT_MANAGEMENT,
          BREADCRUMBS.SNAPSHOT_POLICIES,
          BREADCRUMBS.EDIT_SNAPSHOT_POLICY,
          { text: id },
        ]);
        await this.getPolicy(id);
      } else {
        this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      }
    } else {
      this.context.chrome.setBreadcrumbs([
        BREADCRUMBS.SNAPSHOT_MANAGEMENT,
        BREADCRUMBS.SNAPSHOT_POLICIES,
        BREADCRUMBS.CREATE_SNAPSHOT_POLICY,
      ]);
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

  onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    let newJSON = this.state.policy;
    newJSON.name = name;
    this.setState({ policyId: name, policy: newJSON });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.policy;
    newJSON.description = description;
    this.setState({ policy: newJSON });
  };

  onChangeCreationExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policy;
    newJSON.creation.schedule.cron.expression = expression;
    this.setState({ policy: newJSON });
  };

  onChangeDeletionExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.schedule.cron.expression", expression);
    this.setState({ policy: newJSON });
  };

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    const timezone = e.target.value;
    let newJSON = this.state.policy;
    _.set(newJSON, "creation.schedule.cron.timezone", timezone);
    this.setState({ policy: newJSON });
  };

  onChangeIndices = (e: ChangeEvent<HTMLInputElement>) => {
    const indices = e.target.value;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.indices = indices;
    this.setState({ policy: newJSON });
  };

  onChangeRepository = (e: ChangeEvent<HTMLInputElement>) => {
    const repository = e.target.value;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.repository = repository;
    this.setState({ policy: newJSON });
  };

  onIncludeGlobalStateToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.include_global_state = checked;
    this.setState({ policy: newJSON });
  };

  onIgnoreUnavailableToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.ignore_unavailable = checked;
    this.setState({ policy: newJSON });
  };

  onPartialToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.partial = checked;
    this.setState({ policy: newJSON });
  };

  onChangeMaxCount = (e: ChangeEvent<HTMLInputElement>) => {
    // Received NaN for the `value` attribute. If this is expected, cast the value to a string.
    const maxCount = isNaN(parseInt(e.target.value)) ? 50 : parseInt(e.target.value);
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.condition.max_count", maxCount);
    this.setState({ policy: newJSON });
  };

  onChangeMaxAge = (e: ChangeEvent<HTMLInputElement>) => {
    const maxAge = e.target.value;
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.condition.max_age", maxAge);
    this.setState({ policy: newJSON });
  };

  onChangeMinCount = (e: ChangeEvent<HTMLInputElement>) => {
    const minCount = isNaN(parseInt(e.target.value)) ? 5 : parseInt(e.target.value);
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.condition.min_count", minCount);
    this.setState({ policy: newJSON });
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    // TODO SM clean up state
  };

  onCreate = async () => {
    const { snapshotManagementService } = this.props;
    try {
      const { policyId, policy } = this.state;
      console.log(`sm dev create policy ${JSON.stringify(policy)}`);
      const response = await snapshotManagementService.createPolicy(policyId, policy);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Created policy: ${response.response.policy.name}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Failed to create snapshot policy: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(
        `Failed to create snapshot policy: ${getErrorMessage(err, "There was a problem creating the transform job")}`
      );
    }
  };

  onSubmit = async () => {
    this.setState({ isSubmitting: true });

    await this.onCreate();

    this.setState({ isSubmitting: false });
  };

  render() {
    console.log(`sm dev state ${JSON.stringify(this.state)}`);

    const {
      // name,
      // description,
      // creationExpression,
      // deletionExpression,
      // timezone,
      // indices,
      // repository,
      // includeGlobalState,
      // ignoreUnavailable,
      // partial,
      // maxCount,
      // maxAge,
      // minCount,
      policy,
      policyId,
      isSubmitting,
    } = this.state;

    return (
      <div>
        <EuiTitle size="l">
          <h1>Create policy</h1>
        </EuiTitle>

        <EuiSpacer />

        <ContentPanel title="Policy settings" titleSize="m">
          <CustomLabel title="Policy name" />
          <EuiFormRow>
            <EuiFieldText placeholder="daily-snapshot" value={_.get(policy, "name", "")} onChange={this.onChangeName} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Description" isOptional={true} />
          <EuiFormRow>
            <EuiTextArea
              compressed={true}
              value={_.get(policy, "description", "")}
              onChange={this.onChangeDescription}
              data-test-subj="description"
            />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Source and destination" titleSize="m">
          <CustomLabel title="Indices" />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "snapshot_config.indices", "")} onChange={this.onChangeIndices} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Repository" />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "snapshot_config.repository", "")} onChange={this.onChangeRepository} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <ToggleWrapper
            label={
              <CustomLabel title="Include global state" helpText="Whether to include cluster state in the snapshot." isOptional={true} />
            }
            checked={_.get(policy, "snapshot_config.include_global_state", false)}
            onSwitchChange={this.onIncludeGlobalStateToggle}
          />

          <EuiSpacer size="m" />

          <ToggleWrapper
            label={
              <CustomLabel
                title="Ignore unavailable"
                helpText="Whether to ignore unavailable index rather than fail the snapshot."
                isOptional={true}
              />
            }
            checked={_.get(policy, "snapshot_config.ignore_unavailable", false)}
            onSwitchChange={this.onIgnoreUnavailableToggle}
          />

          <EuiSpacer size="m" />

          <ToggleWrapper
            label={
              <CustomLabel title="Partial" helpText="Whether to allow partial snapshots rather than fail the snapshot." isOptional={true} />
            }
            checked={_.get(policy, "snapshot_config.partial", false)}
            onSwitchChange={this.onPartialToggle}
          />
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="m">
          <CustomLabel title="Cron expression for creation" />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "creation.schedule.cron.expression", "")} onChange={this.onChangeCreationExpression} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Cron expression for deletion" />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "deletion.schedule.cron.expression", "")} onChange={this.onChangeDeletionExpression} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Timezone" />
          <EuiFormRow>
            <EuiSelect
              id="timezone"
              options={timezones}
              value={_.get(policy, "creation.schedule.cron.timezone", "America/Los_Angeles")}
              onChange={this.onChangeTimezone}
            />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Retention period" titleSize="m">
          <CustomLabel title="Max count" />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "deletion.condition.max_count", "")} onChange={this.onChangeMaxCount} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Max age" isOptional={true} />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "deletion.condition.max_age", "")} onChange={this.onChangeMaxAge} placeholder="e.g. 7d" />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Min count" isOptional={true} />
          <EuiFormRow>
            <EuiFieldText value={_.get(policy, "deletion.condition.min_count", "")} onChange={this.onChangeMinCount} />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m"></ContentPanel>

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting}>
              Create
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
