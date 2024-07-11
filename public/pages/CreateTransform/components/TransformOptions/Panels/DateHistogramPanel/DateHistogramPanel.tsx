/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiSmallButton, EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSelect, EuiSpacer, EuiText } from "@elastic/eui";
import { getDateHistogramGroupItem } from "../../../../utils/helpers";
import { CalendarTimeunitOptions, FixedTimeunitOptions, IntervalType } from "../../../../../../utils/constants";
import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../../../models/interfaces";

interface DateHistogramPanelProps {
  name: string;
  handleGroupSelectionChange: (newGroupItem: TransformGroupItem, type: TRANSFORM_AGG_TYPE, name: string) => void;
  aggList: TransformAggItem[];
  closePopover: () => void;
  intervalType: IntervalType;
}

export default function DateHistogramPanel({ name, handleGroupSelectionChange, closePopover, intervalType }: DateHistogramPanelProps) {
  const [dateHistogramInterval, setDateHistogramInterval] = useState(1);
  const [dateHistogramTimeunit, setDateHistogramTimeunit] = useState("m");

  let timeunitOptions, intervalDefinition;
  if (intervalType === IntervalType.FIXED) {
    intervalDefinition = (
      <EuiFieldNumber
        value={dateHistogramInterval}
        onChange={(e) => setDateHistogramInterval(e.target.valueAsNumber)}
        data-test-subj="dateHistogramValueInput"
      />
    );
    timeunitOptions = FixedTimeunitOptions;
  } else {
    intervalDefinition = (
      <div>
        <EuiSpacer size="s" />
        <EuiText size="m">Every 1</EuiText>
      </div>
    );
    timeunitOptions = CalendarTimeunitOptions;
  }

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          <EuiText size="xs">
            <h4>Interval</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <h4>Timeunit</h4>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {intervalDefinition}
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            options={timeunitOptions}
            value={dateHistogramTimeunit}
            onChange={(e) => setDateHistogramTimeunit(e.target.value)}
            data-test-subj="dateHistogramTimeunitSelect"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            fullWidth={false}
            onClick={() => closePopover()}
            style={{ minWidth: 84 }}
            data-test-subj="dateHistogramPanelCancelButton"
          >
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            fill
            fullWidth={false}
            onClick={() => {
              const targetFieldName = `${name} _${GROUP_TYPES.dateHistogram}_${dateHistogramInterval}_${dateHistogramTimeunit}_${intervalType}`;

              //Switch between fixed interval and calendar interval by checking timeunit
              const dateHistogramGroupItem = getDateHistogramGroupItem(
                name,
                targetFieldName,
                dateHistogramInterval,
                dateHistogramTimeunit,
                intervalType
              );
              handleGroupSelectionChange(dateHistogramGroupItem, TRANSFORM_AGG_TYPE.date_histogram, targetFieldName);
            }}
            style={{ minWidth: 55 }}
            data-test-subj="dateHistogramPanelOKButton"
          >
            OK
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
