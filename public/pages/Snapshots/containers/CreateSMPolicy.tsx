/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiSwitchEvent,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from "@elastic/eui";
import React, { ChangeEvent, Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ContentPanel } from "../../../components/ContentPanel";
import { DEFAULT_SM_POLICY } from "../utils/constants";
import moment from "moment-timezone";
import CustomLabel from "../components/CustomLabel";

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

interface CreateSMPolicyProps extends RouteComponentProps {}

interface CreateSMPolicyState {
  name: string;
  description: string;
  creationExpression: string;
  deletionExpression: string;
  timezone: string;
  includeGlobalState: boolean;
  policyJson: any;
}

export default class CreateSMPolicy extends Component<CreateSMPolicyProps, CreateSMPolicyState> {
  constructor(props: CreateSMPolicyProps) {
    super(props);

    const defaultPolicy = JSON.parse(DEFAULT_SM_POLICY);
    this.state = {
      name: "",
      description: "",
      creationExpression: defaultPolicy.creation.schedule.cron.expression,
      deletionExpression: defaultPolicy.deletion.schedule.cron.expression,
      timezone: defaultPolicy.creation.schedule.cron.timezone,
      includeGlobalState: false,
      policyJson: defaultPolicy,
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

  onIncludeGlobalStateToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policyJson;
    newJSON.snapshot_config.include_global_state = checked;
    this.setState({ includeGlobalState: checked, policyJson: newJSON });
  };

  render() {
    console.log(`sm dev state ${JSON.stringify(this.state)}`);

    const { name, description, creationExpression, deletionExpression, timezone, includeGlobalState } = this.state;

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
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <CustomLabel
                title="Include global state"
                helpText="Stores the global cluster state as part of the snapshot."
                isOptional={true}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFormRow>
                <EuiSwitch label="Include global state" checked={includeGlobalState} onChange={this.onIncludeGlobalStateToggle} />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </ContentPanel>
      </div>
    );
  }
}
