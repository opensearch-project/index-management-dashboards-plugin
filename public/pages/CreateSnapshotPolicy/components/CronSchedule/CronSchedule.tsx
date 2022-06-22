/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  EuiCheckbox,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
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
  timezone?: string;
  onChangeTimezone?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const CronSchedule = ({
  frequencyType,
  onChangeFrequencyType,
  cronExpression,
  onCronExpressionChange,
  timezone,
  onChangeTimezone,
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
    console.log(`sm dev built expression ${expression}`);
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
    changeCron({ frequencyType });
  }

  const dayOfWeekCheckbox = (day: string, checkedDay: string) => (
    <EuiFlexItem key={day} grow={false} style={{ marginRight: "0px" }}>
      <EuiCheckbox id={day} label={day} checked={checkedDay === day} onChange={(e) => onDayOfWeekChange(day)} compressed />
    </EuiFlexItem>
  );

  let additionalContent;
  if (frequencyType === "weekly") {
    additionalContent = <EuiFlexGroup>{WEEK_DAYS.map((d) => dayOfWeekCheckbox(d, dayOfWeek))}</EuiFlexGroup>;
  }
  if (frequencyType === "monthly") {
    additionalContent = (
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem>
          <EuiSelect options={[{ value: "day", text: "Day" }]} defaultValue="Day" />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFieldNumber
            value={dayOfMonth}
            onChange={(e) => {
              console.log(`sm dev change day of month ${parseInt(e.target.value)}`);
              onDayOfMonthChange(parseInt(e.target.value));
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
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
              <CustomLabel title="Cron expression" helpText={cronExpressionHelpText} />
              <EuiFieldText
                value={cronExpression}
                onChange={(e) => {
                  onCronExpressionChange(e.target.value);
                }}
              />
            </>
          ) : (
            <>
              <CustomLabel title="Start time" />
              <EuiDatePicker
                showTimeSelect
                showTimeSelectOnly
                selected={startTime(hour, minute)}
                onChange={onStartTimeChange}
                dateFormat="HH:mm"
                timeFormat="HH:mm"
              />
              <EuiSpacer size="s" />

              {additionalContent}
            </>
          )}
        </EuiFlexItem>

        {timezone ? (
          <EuiFlexItem style={{ maxWidth: 200 }}>
            <CustomLabel title="Time zone" />
            <EuiSelect id="timezone" options={TIMEZONES} value={timezone} onChange={onChangeTimezone} />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </>
  );
};

export default CronSchedule;
