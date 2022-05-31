/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFormRow,
  EuiTextArea,
  EuiSelect,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSwitch,
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
import { ROUTES } from "../../../utils/constants";
import { CoreServicesContext } from "../../../components/core_services";
import { getErrorMessage } from "../../../utils/helpers";
import { SnapshotManagementService } from "../../../services";

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

interface CreateSMPolicyProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface CreateSMPolicyState {
  name: string;
  description: string;
  creationExpression: string;
  deletionExpression: string;
  timezone: string;

  indices: string;
  repository: string;
  includeGlobalState: boolean;
  ignoreUnavailable: boolean;
  partial: boolean;

  maxCount: number;
  maxAge: string;
  minCount: number;

  policyJson: any;

  isSubmitting: boolean;
}

export default class CreateSMPolicy extends Component<CreateSMPolicyProps, CreateSMPolicyState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateSMPolicyProps) {
    super(props);

    const defaultPolicy = JSON.parse(DEFAULT_SM_POLICY);
    this.state = {
      name: "",
      description: "",
      creationExpression: defaultPolicy.creation.schedule.cron.expression,
      deletionExpression: defaultPolicy.deletion.schedule.cron.expression,
      timezone: defaultPolicy.creation.schedule.cron.timezone,

      indices: "",
      repository: "",
      includeGlobalState: false,
      ignoreUnavailable: false,
      partial: false,

      maxCount: DEFAULT_DELETE_CONDITION.max_count,
      maxAge: DEFAULT_DELETE_CONDITION.max_age,
      minCount: DEFAULT_DELETE_CONDITION.min_count,

      policyJson: defaultPolicy,

      isSubmitting: false,
    };
  }

  onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    this.setState({ name });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.description = description;
    this.setState({ description: description, policyJson: newJSON });
  };

  onChangeCreationExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.creation.schedule.cron.expression = expression;
    this.setState({ creationExpression: expression, policyJson: newJSON });
  };

  onChangeDeletionExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.deletion.schedule.cron.expression = expression;
    this.setState({ deletionExpression: expression, policyJson: newJSON });
  };

  onChangeTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    const timezone = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.creation.schedule.cron.timezone = timezone;
    this.setState({ timezone: timezone, policyJson: newJSON });
  };

  onChangeIndices = (e: ChangeEvent<HTMLInputElement>) => {
    const indices = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.indices = indices;
    this.setState({ indices: indices, policyJson: newJSON });
  };

  onChangeRepository = (e: ChangeEvent<HTMLInputElement>) => {
    const repository = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.repository = repository;
    this.setState({ repository: repository, policyJson: newJSON });
  };

  onIncludeGlobalStateToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.include_global_state = checked;
    this.setState({ includeGlobalState: checked, policyJson: newJSON });
  };

  onIgnoreUnavailableToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.ignore_unavailable = checked;
    this.setState({ ignoreUnavailable: checked, policyJson: newJSON });
  };

  onPartialToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.parial = checked;
    this.setState({ partial: checked, policyJson: newJSON });
  };

  onChangeMaxCount = (e: ChangeEvent<HTMLInputElement>) => {
    // Received NaN for the `value` attribute. If this is expected, cast the value to a string.
    const maxCount = isNaN(parseInt(e.target.value)) ? 50 : parseInt(e.target.value);
    let newJSON = this.state.policyJson;
    newJSON.deletion.condition.max_count = maxCount;
    this.setState({ maxCount: maxCount, policyJson: newJSON });
  };

  onChangeMaxAge = (e: ChangeEvent<HTMLInputElement>) => {
    const maxAge = e.target.value;
    let newJSON = this.state.policyJson;
    newJSON.deletion.condition.max_age = maxAge;
    this.setState({ maxAge: maxAge, policyJson: newJSON });
  };

  onChangeMinCount = (e: ChangeEvent<HTMLInputElement>) => {
    const minCount = isNaN(parseInt(e.target.value)) ? 5 : parseInt(e.target.value);
    let newJSON = this.state.policyJson;
    newJSON.deletion.condition.min_count = minCount;
    this.setState({ minCount: minCount, policyJson: newJSON });
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.SNAPSHOTS);
  };

  onCreate = async () => {
    const { snapshotManagementService } = this.props;
    try {
      const { name, policyJson } = this.state;
      const response = await snapshotManagementService.createPolicy(name, policyJson);
    } catch (err) {
      this.context.notifications.toasts.addDanger(
        `Failed to create transform: ${getErrorMessage(err, "There was a problem creating the transform job")}`
      );
    }
  };

  onSubmit = async () => {
    this.setState({ isSubmitting: true });
    try {
      await this.onCreate();
    } catch (err) {}
    this.setState({ isSubmitting: false });
  };

  render() {
    console.log(`sm dev state ${JSON.stringify(this.state)}`);

    const {
      name,
      description,
      creationExpression,
      deletionExpression,
      timezone,
      indices,
      repository,
      includeGlobalState,
      ignoreUnavailable,
      partial,
      maxCount,
      maxAge,
      minCount,
      isSubmitting,
    } = this.state;

    return (
      <div>
        <EuiTitle size="l">
          <h1>Create policy</h1>
        </EuiTitle>

        <EuiSpacer />

        <ContentPanel title="Policy info" titleSize="m">
          <CustomLabel title="Name" />
          <EuiFormRow>
            <EuiFieldText placeholder="daily-snapshot" value={name} onChange={this.onChangeName} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Description" isOptional={true} />
          <EuiFormRow>
            <EuiTextArea compressed={true} value={description} onChange={this.onChangeDescription} data-test-subj="description" />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Schedule" titleSize="m">
          <CustomLabel title="Cron expression for creation" />
          <EuiFormRow>
            <EuiFieldText value={creationExpression} onChange={this.onChangeCreationExpression} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Cron expression for deletion" />
          <EuiFormRow>
            <EuiFieldText value={deletionExpression} onChange={this.onChangeDeletionExpression} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Timezone" />
          <EuiFormRow>
            <EuiSelect id="timezone" options={timezones} value={timezone} onChange={this.onChangeTimezone} />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot configuration" titleSize="m">
          <CustomLabel title="Indices" />
          <EuiFormRow>
            <EuiFieldText value={indices} onChange={this.onChangeIndices} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Repository" />
          <EuiFormRow>
            <EuiFieldText value={repository} onChange={this.onChangeRepository} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <ToggleWrapper
            label={
              <CustomLabel title="Include global state" helpText="Whether to include cluster state in the snapshot." isOptional={true} />
            }
            checked={includeGlobalState}
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
            checked={ignoreUnavailable}
            onSwitchChange={this.onIgnoreUnavailableToggle}
          />

          <EuiSpacer size="m" />

          <ToggleWrapper
            label={
              <CustomLabel title="Partial" helpText="Whether to allow partial snapshots rather than fail the snapshot." isOptional={true} />
            }
            checked={partial}
            onSwitchChange={this.onPartialToggle}
          />
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Delete condition" titleSize="m">
          <CustomLabel title="Max count" />
          <EuiFormRow>
            <EuiFieldText value={maxCount} onChange={this.onChangeMaxCount} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Max age" isOptional={true} />
          <EuiFormRow>
            <EuiFieldText value={maxAge} onChange={this.onChangeMaxAge} placeholder="e.g. 7d" />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Min count" isOptional={true} />
          <EuiFormRow>
            <EuiFieldText value={minCount} onChange={this.onChangeMinCount} />
          </EuiFormRow>
        </ContentPanel>

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
