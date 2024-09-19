/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, Fragment } from "react";
import {
  EuiSpacer,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFieldNumber,
  EuiCompressedRadioGroup,
  EuiComboBoxOptionOption,
  EuiPanel,
  EuiTitle,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiText,
} from "@elastic/eui";
import moment from "moment-timezone";
import EuiCompressedComboBox from "../../../../components/ComboBoxWithoutWarning";
import { RollupService } from "../../../../services";
import { FieldItem } from "../../../../../models/interfaces";
import { CalendarTimeunitOptions, FixedTimeunitOptions } from "../../../../utils/constants";

interface TimeAggregationProps {
  rollupService: RollupService;
  intervalValue: number;
  intervalType: string;
  selectedTimestamp: EuiComboBoxOptionOption<String>[];
  timestampError: string;
  timeunit: string;
  timezone: string;
  fieldsOption: FieldItem[];

  onChangeIntervalType: (optionId: string) => void;
  onChangeIntervalValue: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeTimestamp: (options: EuiComboBoxOptionOption<String>[]) => void;
  onChangeTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeTimezone: (e: ChangeEvent<HTMLSelectElement>) => void;
}

interface TimeAggregationState {}

const radios = [
  {
    id: "fixed",
    label: "Fixed",
  },
  {
    id: "calendar",
    label: "Calendar",
  },
];

const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

export default class TimeAggregation extends Component<TimeAggregationProps, TimeAggregationState> {
  constructor(props: TimeAggregationProps) {
    super(props);
  }

  render() {
    const {
      intervalType,
      intervalValue,
      selectedTimestamp,
      timestampError,
      timeunit,
      timezone,
      onChangeIntervalType,
      onChangeIntervalValue,
      onChangeTimestamp,
      onChangeTimeunit,
      onChangeTimezone,
      fieldsOption,
    } = this.props;

    // Filter options for date histogram
    const dateFields = fieldsOption.filter((item) => item.type == "date");

    return (
      <EuiPanel>
        <EuiTitle size="s">
          <h2>Time aggregation </h2>
        </EuiTitle>
        <EuiFormHelpText>
          Your source indices must include a timestamp field. The rollup job creates a date histogram for the field you specify.
        </EuiFormHelpText>
        <EuiHorizontalRule margin="xs" />
        <EuiSpacer size="s" />
        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <h3>Timestamp field</h3>
            </EuiText>
          }
          error={timestampError}
          isInvalid={!!timestampError}
        >
          <EuiCompressedComboBox
            placeholder="Select timestamp"
            options={dateFields}
            selectedOptions={selectedTimestamp}
            onChange={onChangeTimestamp}
            singleSelection={{ asPlainText: true }}
            isInvalid={!!timestampError}
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="m" />
        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <h3>Interval type</h3>
            </EuiText>
          }
        >
          <EuiCompressedRadioGroup
            options={radios}
            idSelected={intervalType}
            onChange={(id) => onChangeIntervalType(id)}
            name="intervalType"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <h3>Interval</h3>
        </EuiText>
        <EuiFlexGroup style={{ maxWidth: 300 }} alignItems="center">
          {intervalType == "fixed" ? (
            <Fragment>
              <EuiSpacer size="m" />
              <EuiFlexItem grow={false} style={{ width: 100 }}>
                <EuiCompressedFormRow>
                  <EuiCompressedFieldNumber min={1} value={intervalType == "fixed" ? intervalValue : 1} onChange={onChangeIntervalValue} />
                </EuiCompressedFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCompressedFormRow>
                  <EuiCompressedSelect
                    id="selectTimeunit"
                    options={intervalType == "fixed" ? FixedTimeunitOptions : CalendarTimeunitOptions}
                    value={timeunit}
                    onChange={onChangeTimeunit}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>
            </Fragment>
          ) : (
            <Fragment>
              <EuiFlexItem grow={false}>
                <EuiCompressedFormRow>
                  <EuiText size="s">
                    <dd>Every 1</dd>{" "}
                  </EuiText>
                </EuiCompressedFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCompressedFormRow>
                  <EuiCompressedSelect
                    id="selectTimeunit"
                    options={intervalType == "fixed" ? FixedTimeunitOptions : CalendarTimeunitOptions}
                    value={timeunit}
                    onChange={onChangeTimeunit}
                  />
                </EuiCompressedFormRow>
              </EuiFlexItem>
            </Fragment>
          )}
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiCompressedFormRow
          label={
            <EuiText size="s">
              <h3>Timezone</h3>
            </EuiText>
          }
          helpText="A day starts from 00:00:00 in the specified timezone."
        >
          <EuiCompressedSelect id="timezone" options={timezones} value={timezone} onChange={onChangeTimezone} />
        </EuiCompressedFormRow>
      </EuiPanel>
    );
  }
}
