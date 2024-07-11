/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import moment from "moment-timezone";
import {
  EuiSpacer,
  EuiCheckbox,
  EuiRadioGroup,
  EuiCompressedFormRow,
  EuiSelect,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTextArea,
  EuiFormHelpText,
  EuiText,
} from "@elastic/eui";
import { DelayTimeunitOptions, ScheduleIntervalTimeunitOptions } from "../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ScheduleProps {
  isEdit: boolean;
  rollupId: string;
  rollupIdError: string;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  continuousDefinition: string;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  cronExpression: string;
  cronTimezone: string;
  pageSize: number;
  delayTime: number | string;
  delayTimeunit: string;
  onChangeJobEnabledByDefault: () => void;
  onChangeCron: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeCronTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeDelayTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeContinuousDefinition: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeContinuousJob: (optionId: string) => void;
  onChangeDelayTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const radios = [
  {
    id: "no",
    label: "No",
  },
  {
    id: "yes",
    label: "Yes",
  },
];

const selectInterval = (
  interval: number,
  intervalTimeunit: string,
  intervalError: string,
  onChangeInterval: (e: ChangeEvent<HTMLInputElement>) => void,
  onChangeTimeunit: (value: ChangeEvent<HTMLSelectElement>) => void
) => (
  <React.Fragment>
    <EuiFlexGroup style={{ maxWidth: 400 }}>
      <EuiFlexItem grow={false} style={{ width: 200 }}>
        <EuiCompressedFormRow label="Rollup interval" error={intervalError} isInvalid={intervalError != ""}>
          <EuiFieldNumber value={interval} onChange={onChangeInterval} isInvalid={intervalError != ""} />
        </EuiCompressedFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiCompressedFormRow hasEmptyLabelSpace={true}>
          <EuiSelect
            id="selectIntervalTimeunit"
            options={ScheduleIntervalTimeunitOptions}
            value={intervalTimeunit}
            onChange={onChangeTimeunit}
            isInvalid={interval == undefined || interval <= 0}
          />
        </EuiCompressedFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  </React.Fragment>
);

const isContinuous = (continuousJob: string, onChangeContinuousJob: (optionId: string) => void) => (
  <React.Fragment>
    <EuiCompressedFormRow label="Continuous">
      <EuiRadioGroup options={radios} idSelected={continuousJob} onChange={(id) => onChangeContinuousJob(id)} name="continuousJob" />
    </EuiCompressedFormRow>
    <EuiSpacer size="m" />
  </React.Fragment>
);

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

export default class Schedule extends Component<ScheduleProps> {
  constructor(props: ScheduleProps) {
    super(props);
  }

  render() {
    const {
      isEdit,
      jobEnabledByDefault,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      intervalError,
      cronExpression,
      cronTimezone,
      pageSize,
      delayTime,
      delayTimeunit,
      onChangeJobEnabledByDefault,
      onChangeCron,
      onChangeCronTimezone,
      onChangeDelayTime,
      onChangeIntervalTime,
      onChangePage,
      onChangeContinuousDefinition,
      onChangeContinuousJob,
      onChangeDelayTimeunit,
      onChangeIntervalTimeunit,
    } = this.props;
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Schedule" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          {!isEdit && (
            <EuiCheckbox
              id="jobEnabledByDefault"
              label="Enable job by default"
              checked={jobEnabledByDefault}
              onChange={onChangeJobEnabledByDefault}
              data-test-subj="jobEnabledByDefault"
            />
          )}
          <EuiSpacer size="m" />
          {!isEdit && isContinuous(continuousJob, onChangeContinuousJob)}

          <EuiCompressedFormRow label="Rollup execution frequency">
            <EuiSelect
              id="continuousDefinition"
              options={[
                { value: "fixed", text: "Define by fixed interval" },
                { value: "cron", text: "Define by cron expression" },
              ]}
              value={continuousDefinition}
              onChange={onChangeContinuousDefinition}
            />
          </EuiCompressedFormRow>
          <EuiSpacer size="m" />

          {continuousDefinition == "fixed" ? (
            selectInterval(interval, intervalTimeunit, intervalError, onChangeIntervalTime, onChangeIntervalTimeunit)
          ) : (
            <React.Fragment>
              <EuiCompressedFormRow label="Define by cron expression">
                <EuiTextArea value={cronExpression} onChange={onChangeCron} compressed={true} />
              </EuiCompressedFormRow>
              <EuiCompressedFormRow label="Timezone" helpText="A day starts from 00:00:00 in the specified timezone.">
                <EuiSelect id="timezone" options={timezones} value={cronTimezone} onChange={onChangeCronTimezone} />
              </EuiCompressedFormRow>
            </React.Fragment>
          )}

          <EuiSpacer size="m" />

          <EuiCompressedFormRow
            label="Page per execution"
            helpText="The number of pages every execution processes. A larger number means faster execution and higher costs on memory."
          >
            <EuiFieldNumber min={1} placeholder="1000" value={pageSize} onChange={onChangePage} />
          </EuiCompressedFormRow>
          <EuiSpacer size="m" />
          <EuiFlexGroup style={{ maxWidth: 400 }}>
            <EuiFlexItem grow={false} style={{ width: 200 }}>
              <EuiFlexGroup gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiText size="xs">
                    <h4>Execution delay</h4>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="xs" color="subdued">
                    <i> – optional</i>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiCompressedFormRow>
                <EuiFieldNumber value={delayTime} onChange={onChangeDelayTime} />
              </EuiCompressedFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCompressedFormRow hasEmptyLabelSpace={true}>
                <EuiSelect id="selectTimeunit" options={DelayTimeunitOptions} value={delayTimeunit} onChange={onChangeDelayTimeunit} />
              </EuiCompressedFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFormHelpText style={{ maxWidth: 400 }}>
            The amount of time the job waits for data ingestion to accommodate any necessary processing time.
          </EuiFormHelpText>
        </div>
      </ContentPanel>
    );
  }
}
