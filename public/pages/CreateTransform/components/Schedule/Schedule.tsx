/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import {
  EuiSpacer,
  EuiCompressedCheckbox,
  EuiCompressedRadioGroup,
  EuiCompressedFormRow,
  EuiCompressedFieldNumber,
  EuiAccordion,
  EuiHorizontalRule,
  EuiText,
  EuiTitle,
  EuiPanel,
} from "@elastic/eui";
import { selectInterval } from "../../../Transforms/utils/metadataHelper";

interface ScheduleProps {
  isEdit: boolean;
  transformId: string;
  transformIdError: string;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  pageSize: number;
  onChangeJobEnabledByDefault: () => void;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  onChangeContinuousJob: (optionId: string) => void;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
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

const isContinuous = (continuousJob: string, onChangeContinuousJob: (optionId: string) => void) => (
  <React.Fragment>
    <EuiCompressedFormRow
      label={
        <EuiText size="s">
          <h4>Continuous</h4>
        </EuiText>
      }
    >
      <EuiCompressedRadioGroup
        options={radios}
        idSelected={continuousJob}
        onChange={(id) => onChangeContinuousJob(id)}
        name="continuousJob"
      />
    </EuiCompressedFormRow>
    <EuiSpacer size="m" />
  </React.Fragment>
);

export default class Schedule extends Component<ScheduleProps> {
  constructor(props: ScheduleProps) {
    super(props);
  }

  render() {
    const {
      isEdit,
      jobEnabledByDefault,
      continuousJob,
      interval,
      intervalTimeunit,
      intervalError,
      pageSize,
      onChangeJobEnabledByDefault,
      onChangeContinuousJob,
      onChangeIntervalTime,
      onChangeIntervalTimeunit,
      onChangePage,
    } = this.props;
    return (
      <EuiPanel>
        <EuiTitle size="s">
          <h2>Schedule</h2>
        </EuiTitle>
        <EuiHorizontalRule margin="xs" />
        <div>
          {!isEdit && (
            <EuiCompressedCheckbox
              id="jobEnabledByDefault"
              label="Job enabled by default"
              checked={jobEnabledByDefault}
              onChange={onChangeJobEnabledByDefault}
              data-test-subj="jobEnabledByDefault"
            />
          )}
          <EuiSpacer size="m" />

          {!isEdit && isContinuous(continuousJob, onChangeContinuousJob)}

          {/* TODO: Replace with switch block when define by cron expressions is supported. */}
          {selectInterval(interval, intervalTimeunit, intervalError, onChangeIntervalTime, onChangeIntervalTimeunit)}
          <EuiSpacer size="m" />
          <EuiHorizontalRule margin="xs" />
          <EuiSpacer size="m" />
          <EuiAccordion id="pagePerExecution" buttonContent="Advanced">
            <EuiSpacer size="m" />
            <EuiCompressedFormRow
              label="Pages per execution"
              helpText={`Determines the number of transformed buckets that are
                        computed and indexed at a time. A larger number means
                        better throughput for each search request, but costs
                        more memory and incurs higher latency. An exception
                        occurs when memory limits are exceeded. We recommend
                        you to start with the default value, and adjust based
                        on your use case and shard size.`}
            >
              <EuiCompressedFieldNumber min={1} placeholder="1000" value={pageSize} onChange={onChangePage} />
            </EuiCompressedFormRow>
          </EuiAccordion>
        </div>
      </EuiPanel>
    );
  }
}
