/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../../../models/interfaces";
import React, { useState } from "react";
import {
  EuiButton,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSelect,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import { DateHistogramInfoText, DateHistogramTimeunitOptions } from "../../../../utils/constants";
import { getDateHistogramGroupItem, getGroupByDateHistogramItem } from "../../../../utils/helpers";

interface DateHistogramPanelProps {
  name: string;
  handleGroupSelectionChange: (newGroupItem: TransformGroupItem, type: TRANSFORM_AGG_TYPE, name: string) => void;
  aggList: TransformAggItem[];
  closePopover: () => void;
}

export default function DateHistogramPanel({ name, handleGroupSelectionChange, closePopover }: DateHistogramPanelProps) {
  const [dateHistogramInterval, setDateHistogramInterval] = useState(1);
  const [dateHistogramTimeunit, setDateHistogramTimeunit] = useState("m");

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          <EuiText size="xs">
            <h4>Date histogram interval</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs">
            <h4>Date histogram timeunit</h4>
          </EuiText>

          <EuiToolTip position="top" content={DateHistogramInfoText}>
            <EuiIcon type="questionInCircle" />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          <EuiFieldNumber value={dateHistogramInterval} onChange={(e) => setDateHistogramInterval(e.target.valueAsNumber)} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSelect
            options={DateHistogramTimeunitOptions}
            value={dateHistogramTimeunit}
            onChange={(e) => setDateHistogramTimeunit(e.target.value)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            fullWidth={false}
            onClick={() => {
              const targetFieldName = `${name} _${GROUP_TYPES.dateHistogram}_${dateHistogramInterval}_${dateHistogramTimeunit}`;

              //Switch between fixed interval and calendar interval by checking timeunit
              const dateHistogramGroupItem = getDateHistogramGroupItem(name, targetFieldName, dateHistogramInterval, dateHistogramTimeunit);
              //Debug use
              console.log(targetFieldName);
              console.log(JSON.stringify(dateHistogramGroupItem));
              handleGroupSelectionChange(dateHistogramGroupItem, TRANSFORM_AGG_TYPE.date_histogram, targetFieldName);
            }}
            style={{ minWidth: 55 }}
          >
            OK
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
