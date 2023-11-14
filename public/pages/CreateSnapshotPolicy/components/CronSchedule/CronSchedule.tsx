/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import _ from "lodash";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  EuiCheckbox,
  EuiComboBox,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiSelect,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import moment from "moment-timezone";
import CustomLabel from "../../../../components/CustomLabel";
import { WEEK_DAYS, CRON_SCHEDULE_FREQUENCY_TYPE, TIMEZONES } from "./constants";
import { buildCronExpression, parseCronExpression, startTime } from "./helper";
import { CRON_EXPRESSION_DOCUMENTATION_URL } from "../../../../utils/constants";

interface CronScheduleProps {
  frequencyType: string;
  onChangeFrequencyType: (e: ChangeEvent<HTMLSelectElement>) => void;
  cronExpression: string;
  onCronExpressionChange: (expression: string) => void;
  showTimezone?: boolean;
  timezone?: string;
  onChangeTimezone?: (timezone: string) => void;
  timezoneError?: string;
  frequencyTitle?: string;
}

const CronSchedule = ({
  frequencyType,
  onChangeFrequencyType,
  cronExpression,
  onCronExpressionChange,
  showTimezone,
  timezone,
  onChangeTimezone,
  timezoneError,
  frequencyTitle = "Schedule frequency",
}: CronScheduleProps) => {
  const { minute: initMin, hour: initHour, dayOfWeek: initWeek, dayOfMonth: initMonth } = parseCronExpression(cronExpression);

  const [minute, setMinute] = useState(initMin);
  const [hour, setHour] = useState(initHour);
  const [dayOfWeek, setWeek] = useState(initWeek);
  const [dayOfMonth, setMonth] = useState(initMonth);

  // When edit policy is clicked, during the initial render DEFAULT values get passed
  // As a result when the actual policy details are passed, the state does not get updated and we end up
  // showing incorrect values in schedule controls.
  if (initHour !== hour) {
    setHour(initHour);
  }

  if (initMin !== minute) {
    setMinute(initMin);
  }

  if (initWeek !== dayOfWeek) {
    setWeek(initWeek);
  }

  if (initMonth !== dayOfMonth) {
    setMonth(initMonth);
  }

  useEffect(
    () => {
      changeCron();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minute, hour, dayOfWeek, dayOfMonth]
  );

  const changeCron = (input?: any) => {
    let cronParts = { hour, minute, dayOfWeek, dayOfMonth, frequencyType };
    cronParts = { ...cronParts, ...input };
    const expression = buildCronExpression(cronParts, cronExpression);
    // console.log(`sm dev built expression ${expression}`);
    onCronExpressionChange(expression);
  };

  function onDayOfWeekChange(newDayOfWeek: string) {
    setWeek(newDayOfWeek);
    // changeCron({ dayOfWeek });
  }

  function onDayOfMonthChange(newDayOfMonth: number) {
    setMonth(newDayOfMonth);
    // changeCron({ dayOfMonth });
  }

  function onStartTimeChange(date: moment.Moment) {
    const min = date.minute();
    const hr = date.hour();
    setMinute(min);
    setHour(hr);
    // changeCron({ minute, hour });
  }

  function onTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    const freqType = e.target.value;
    onChangeFrequencyType(e);
    if (freqType === "hourly") setMinute(0);
    changeCron({ freqType });
  }

  const dayOfWeekCheckbox = (day: string, checkedDay: string) => (
    <EuiFlexItem key={day} grow={false} style={{ marginRight: "0px" }}>
      <EuiCheckbox id={day} label={day} checked={checkedDay === day} onChange={(e) => onDayOfWeekChange(day)} compressed />
    </EuiFlexItem>
  );

  let startTimeContent;
  startTimeContent = (
    <EuiDatePicker
      showTimeSelect
      showTimeSelectOnly
      selected={startTime(hour, minute)}
      onChange={onStartTimeChange}
      dateFormat="HH:mm"
      timeFormat="HH:mm"
    />
  );
  if (frequencyType === "hourly") {
    startTimeContent = <EuiText size="s">Starts at the beginning of the hour.</EuiText>;
  }

  let additionalContent;
  if (frequencyType === "weekly") {
    // TODO SM if use dayOfWeek not initWeek, somehow it would be SUN
    additionalContent = <EuiFlexGroup>{WEEK_DAYS.map((d) => dayOfWeekCheckbox(d, initWeek))}</EuiFlexGroup>;
  }
  if (frequencyType === "monthly") {
    additionalContent = (
      <>
        <CustomLabel title="On the" />
        <EuiFlexGroup gutterSize="m">
          <EuiFlexItem>
            <EuiSelect options={[{ value: "day", text: "Day" }]} defaultValue="Day" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFieldNumber
              value={dayOfMonth}
              onChange={(e) => {
                onDayOfMonthChange(parseInt(e.target.value, 10));
              }}
              min={1}
              max={31}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  const cronExpressionHelpText = (
    <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
      <p style={{ fontWeight: 200, fontSize: "12px" }}>
        Use Cron expression to define complex schedule.{" "}
        <EuiLink href={CRON_EXPRESSION_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
          Learn more
        </EuiLink>
      </p>
    </EuiText>
  );

  return (
    <>
      <CustomLabel title={frequencyTitle} />
      <EuiSelect id="creationCronScheduleType" options={CRON_SCHEDULE_FREQUENCY_TYPE} value={frequencyType} onChange={onTypeChange} />

      <EuiSpacer size="m" />

      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
        <EuiFlexItem style={{ maxWidth: 400 }}>
          {frequencyType === "custom" ? (
            <>
              <CustomLabel title="Cron expression" />
              <EuiFormRow helpText={cronExpressionHelpText}>
                <EuiFieldText
                  value={cronExpression}
                  onChange={(e) => {
                    onCronExpressionChange(e.target.value);
                  }}
                />
              </EuiFormRow>
            </>
          ) : (
            <>
              <CustomLabel title="Start time" />
              {startTimeContent}

              <EuiSpacer size="s" />

              {additionalContent}
            </>
          )}
        </EuiFlexItem>

        {showTimezone ? (
          <EuiFlexItem style={{ maxWidth: 250 }}>
            <CustomLabel title="Time zone" />
            <EuiFormRow isInvalid={!!timezoneError} error={timezoneError}>
              <EuiComboBox
                placeholder="Select a time zone"
                singleSelection={{ asPlainText: true }}
                options={TIMEZONES}
                renderOption={({ label: tz }) => `${tz} (${moment.tz(tz).format("Z")})`}
                selectedOptions={[{ label: timezone ?? "" }]}
                onChange={(options) => {
                  if (onChangeTimezone) {
                    onChangeTimezone(_.first(options)?.label ?? "");
                  }
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </>
  );
};

export default CronSchedule;
