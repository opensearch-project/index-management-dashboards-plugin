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
import { EuiButton, EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiSpacer } from "@elastic/eui";
interface HistogramPanelProps {
  name: string;
  handleGroupSelectionChange: (newGroupItem: TransformGroupItem, type: TRANSFORM_AGG_TYPE, name: string) => void;
  aggList: TransformAggItem[];
  closePopover: () => void;
}

export default function HistogramPanel({ name, handleGroupSelectionChange, closePopover }: HistogramPanelProps) {
  const [histogramInterval, setHistogramInterval] = useState(5);

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: 109 }}>
          <EuiFormRow label="Histogram interval">
            <EuiFieldNumber value={histogramInterval} onChange={(e) => setHistogramInterval(e.target.valueAsNumber)} />
          </EuiFormRow>
          <EuiSpacer size="s" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}></EuiFlexItem>
      </EuiFlexGroup>
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
              const targetFieldName = `${name} _${GROUP_TYPES.histogram}_${histogramInterval}`;
              handleGroupSelectionChange(
                {
                  histogram: {
                    source_field: name,
                    target_field: targetFieldName,
                    interval: histogramInterval,
                  },
                },
                TRANSFORM_AGG_TYPE.histogram,
                targetFieldName
              );
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
