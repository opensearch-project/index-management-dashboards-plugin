/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiComboBox, EuiComboBoxOptionOption, EuiFieldText, EuiFormRow } from "@elastic/eui";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  pipelines: EuiComboBoxOptionOption<void>[];
  selectedPipelines?: EuiComboBoxOptionOption<void>[];
  onSelectedPipelinesChange: (options: EuiComboBoxOptionOption<void>[]) => void;
  width?: string;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  const { slices, onSlicesChange, pipelines, selectedPipelines, onSelectedPipelinesChange, width } = props;

  return (
    <div style={{ padding: "10px 10px", width: width }}>
      <EuiFormRow
        label="Slices"
        helpText="Number of sub-tasks OpenSearch should divide this task into. Default is 1, which means OpenSearch should not divide this task. Setting this parameter to auto indicates to OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText id="slices" value={slices} onChange={onSlicesChange} />
      </EuiFormRow>
      <EuiFormRow label="Pipeline" helpText="Pipeline pre-process documents before writing into destination">
        <EuiComboBox
          aria-label="Ingest Pipeline"
          placeholder="Select a single pipeline"
          singleSelection={{ asPlainText: true }}
          options={pipelines}
          selectedOptions={selectedPipelines}
          onChange={onSelectedPipelinesChange}
        />
      </EuiFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
