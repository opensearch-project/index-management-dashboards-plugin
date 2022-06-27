/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
import CustomLabel from "../../../../components/CustomLabel";
import { WEEK_DAYS, CRON_SCHEDULE_FREQUENCY_TYPE, TIMEZONES } from "./constants";
import { buildCronExpression, parseCronExpression, startTime } from "./helper";
import moment from "moment-timezone";
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
}: CronScheduleProps) => {
  const { minute: initMin, hour: initHour, dayOfWeek: initWeek, dayOfMonth: initMonth } = parseCronExpression(cronExpression);

  const [minute, setMinute] = useState(initMin);
  const [hour, setHour] = useState(initHour);
  const [dayOfWeek, setWeek] = useState(initWeek);
  const [dayOfMonth, setMonth] = useState(initMonth);

  useEffect(() => {
    changeCron();
  }, [minute, hour, dayOfWeek, dayOfMonth]);

  const changeCron = (input?: any) => {
    let cronParts = { hour, minute, dayOfWeek, dayOfMonth, frequencyType };
    cronParts = { ...cronParts, ...input };
    const expression = buildCronExpression(cronParts, cronExpression);
    // console.log(`sm dev built expression ${expression}`);
    onCronExpressionChange(expression);
  };

  function onDayOfWeekChange(dayOfWeek: string) {
    setWeek(dayOfWeek);
    // changeCron({ dayOfWeek });
  }

  function onDayOfMonthChange(dayOfMonth: number) {
    setMonth(dayOfMonth);
    // changeCron({ dayOfMonth });
  }

  function onStartTimeChange(date: moment.Moment) {
    const minute = date.minute();
    const hour = date.hour();
    setMinute(minute);
    setHour(hour);
    // changeCron({ minute, hour });
  }

  function onTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    const frequencyType = e.target.value;
    onChangeFrequencyType(e);
    if (frequencyType === "hourly") setMinute(0);
    changeCron({ frequencyType });
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
                onDayOfMonthChange(parseInt(e.target.value));
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
        <EuiLink href={CRON_EXPRESSION_DOCUMENTATION_URL} target="_blank">
          Learn more
        </EuiLink>
      </p>
    </EuiText>
  );

  return (
    <>
      <CustomLabel title="Schedule frequency" />
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
