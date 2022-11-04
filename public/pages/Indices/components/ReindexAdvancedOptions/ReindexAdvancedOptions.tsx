/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiFieldText, EuiFormRow } from "@elastic/eui";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  width?: string;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  const { slices, onSlicesChange, width } = props;

  return (
    <div style={{ padding: "10px 10px", width: width }}>
      <EuiFormRow
        label="Slices"
        helpText="Number of sub-tasks OpenSearch should divide this task into. Default is 1, which means OpenSearch should not divide this task. Setting this parameter to auto indicates to OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText id="slices" value={slices} onChange={onSlicesChange} />
      </EuiFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
