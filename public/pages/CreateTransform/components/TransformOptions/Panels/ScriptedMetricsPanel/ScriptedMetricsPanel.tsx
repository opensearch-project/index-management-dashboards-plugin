/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiForm, EuiFormRow, EuiPanel, EuiCodeEditor, EuiSpacer } from "@elastic/eui";
import { TRANSFORM_AGG_TYPE, TransformAggItem } from "../../../../../../../models/interfaces";

interface ScriptedMetricsPanelProps {
  name: string;
  aggSelection: any;
  handleAggSelectionChange: (aggItem: TransformAggItem) => void;
  closePopover: () => void;
}

export default function ScriptedMetricsPanel({ name, aggSelection, handleAggSelectionChange, closePopover }: ScriptedMetricsPanelProps) {
  const [script, setScript] = useState("");

  return (
    <EuiPanel>
      <EuiForm>
        <EuiFormRow label="Scripted metrics">
          <EuiCodeEditor
            style={{ width: 0.38 * window.innerWidth, height: 0.4 * window.innerHeight }}
            value={script}
            onChange={(value: string) => setScript(value)}
            mode="json"
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiButton fullWidth={false} onClick={() => closePopover()}>
              Cancel
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              fullWidth={false}
              onClick={() => {
                const aggItem: TransformAggItem = {
                  type: TRANSFORM_AGG_TYPE.scripted_metric,
                  name: `scripted_metric_${name}`,
                  item: {
                    scripted_metric: JSON.parse(script),
                  },
                };
                aggSelection[`scripted_metric_${name}`] = {
                  scripted_metric: JSON.parse(script),
                };
                handleAggSelectionChange(aggItem);
              }}
              style={{ minWidth: 55 }}
            >
              OK
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </EuiPanel>
  );
}
