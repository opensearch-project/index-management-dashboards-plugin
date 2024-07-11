/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GROUP_TYPES, TRANSFORM_AGG_TYPE, TransformAggItem, TransformGroupItem } from "../../../../../../../models/interfaces";
import React, { useState } from "react";
import { EuiSmallButton, EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiCompressedFormRow, EuiPanel, EuiSpacer } from "@elastic/eui";

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
          <EuiCompressedFormRow label="Histogram interval">
            <EuiFieldNumber value={histogramInterval} onChange={(e) => setHistogramInterval(e.target.valueAsNumber)} />
          </EuiCompressedFormRow>
          <EuiSpacer size="s" />
        </EuiFlexItem>
        <EuiFlexItem grow={false} />
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiSmallButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
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
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
