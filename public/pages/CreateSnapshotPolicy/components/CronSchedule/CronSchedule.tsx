/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import React, { ChangeEvent } from "react";
import { EuiCheckbox, EuiDatePicker, EuiFieldNumber, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiSelect, EuiSpacer } from "@elastic/eui";
import moment from "moment-timezone";
import { WEEK_DAYS } from "../../../SnapshotPolicies/constants";
import CustomLabel from "../../../../components/CustomLabel";

interface CronScheduleProps {
  frequencyType: string;
  onChangeFrequencyType: (e: ChangeEvent<HTMLSelectElement>) => void;
  startTime: moment.Moment;
  onChangeStartTime: (date: moment.Moment | null) => void;
  timezone?: string;
  onChangeTimezone?: (e: ChangeEvent<HTMLSelectElement>) => void;
  cronExpression: string;
  onChangeCronExpression: (e: ChangeEvent<HTMLInputElement>) => void;
  dayOfWeek: string;
  onChangeDayOfWeek: (day: string) => void;
  dayOfMonth: number;
  onChangeDayOfMonth: (day: number) => void;
}

const CronSchedule = ({
  frequencyType,
  onChangeFrequencyType,
  startTime,
  onChangeStartTime,
  timezone,
  onChangeTimezone,
  cronExpression,
  onChangeCronExpression,
  dayOfWeek,
  onChangeDayOfWeek,
  dayOfMonth,
  onChangeDayOfMonth,
}: CronScheduleProps) => {
  const cronScheduleTypeOptions = [
    { value: "hourly", text: "Hourly" },
    { value: "daily", text: "Daily" },
    { value: "weekly", text: "Weekly" },
    { value: "monthly", text: "Monthly" },
    { value: "custom", text: "Custom" },
  ];

  const timezones = moment.tz.names().map((tz) => ({ label: tz, text: tz }));

  const days = WEEK_DAYS;
  const dayOfWeekCheckbox = (day: string, checkedDay: string) => (
    <EuiFlexItem key={day} grow={false} style={{ marginRight: "0px" }}>
      <EuiCheckbox id={day} label={day} checked={checkedDay === day} onChange={(e) => onChangeDayOfWeek(day)} compressed />
    </EuiFlexItem>
  );

  let additionalContent;
  if (frequencyType === "weekly") {
    additionalContent = <EuiFlexGroup>{days.map((d) => dayOfWeekCheckbox(d, dayOfWeek))}</EuiFlexGroup>;
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
              onChangeDayOfMonth(parseInt(e.target.value));
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <>
      <CustomLabel title="Schedule frequency" />
      <EuiSelect id="creationCronScheduleType" options={cronScheduleTypeOptions} value={frequencyType} onChange={onChangeFrequencyType} />

      <EuiSpacer size="m" />

      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
        <EuiFlexItem style={{ maxWidth: 400 }}>
          {frequencyType === "custom" ? (
            <>
              <CustomLabel title="Custom expression" />
              <EuiFieldText value={cronExpression} onChange={onChangeCronExpression} />
            </>
          ) : (
            <>
              <CustomLabel title="Start time" />
              <EuiDatePicker
                showTimeSelect
                showTimeSelectOnly
                selected={startTime}
                onChange={onChangeStartTime}
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
            <CustomLabel title="Timezone" />
            <EuiSelect id="timezone" options={timezones} value={timezone} onChange={onChangeTimezone} />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </>
  );
};

export default CronSchedule;
