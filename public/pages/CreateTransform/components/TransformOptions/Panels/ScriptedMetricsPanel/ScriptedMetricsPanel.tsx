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

import React, { useState } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiCodeEditor,
  EuiSpacer,
 } from "@elastic/eui";
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
        <EuiFormRow label="JSON script">
          <EuiCodeEditor value={script} onChange={(value: string) => setScript(value)} mode="json" width="100%" height="250px" />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
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
                    scripted_metric: JSON.parse(script)
                    }
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
