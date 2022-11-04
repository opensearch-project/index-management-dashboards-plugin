/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiFieldText, EuiFormRow, EuiSpacer, EuiSwitch, EuiSwitchEvent } from "@elastic/eui";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  waitForComplete: boolean;
  onWaitForComplete: (e: EuiSwitchEvent) => void;
  width?: string;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  const { slices, onSlicesChange, width, waitForComplete, onWaitForComplete } = props;

  return (
    <div style={{ padding: "10px 10px", width: width }}>
      <EuiFormRow
        label="Slices"
        helpText="Number of sub-tasks OpenSearch should divide this task into. Default is 1, which means OpenSearch should not divide this task. Setting this parameter to auto indicates to OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText id="slices" value={slices} onChange={onSlicesChange} />
      </EuiFormRow>

      <EuiSpacer />
      <EuiFormRow
        label="Wait for reindex completion"
        helpText="Waits for the matching tasks to complete.If the source index is medium or large in size, please define the setting to false so the reindex API results will be stored on the _tasks API."
      >
        <EuiSwitch name="switch" label="Wait task to complete" checked={waitForComplete} onChange={onWaitForComplete} />
      </EuiFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
