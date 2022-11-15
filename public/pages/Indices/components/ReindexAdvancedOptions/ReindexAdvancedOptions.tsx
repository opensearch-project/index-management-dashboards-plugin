/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiLink,
  EuiRadioGroup,
  EuiSpacer,
  EuiSwitch,
  EuiSwitchEvent,
  EuiText,
} from "@elastic/eui";
import { DSL_DOCUMENTATION_URL } from "../../../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sliceErr?: string;
  pipelines: EuiComboBoxOptionOption<void>[];
  selectedPipelines?: EuiComboBoxOptionOption<void>[];
  onSelectedPipelinesChange: (options: EuiComboBoxOptionOption<void>[]) => void;
  queryJsonString: string;
  onQueryJsonChange: (val: string) => void;
  conflicts: string;
  onConflictsChange: (val: string) => void;
  subset: boolean;
  onSubsetChange: (event: EuiSwitchEvent) => void;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  const {
    slices,
    sliceErr,
    onSlicesChange,
    pipelines,
    selectedPipelines,
    onSelectedPipelinesChange,
    queryJsonString,
    onQueryJsonChange,
  } = props;
  const { conflicts, onConflictsChange } = props;
  const { subset, onSubsetChange } = props;

  return (
    <div style={{ padding: "10px 10px" }}>
      <CustomFormRow label="Reindex subset of source">
        <EuiSwitch
          label="Reindex subset of source"
          data-test-subj="subsetSwitch"
          showLabel={false}
          compressed
          checked={subset}
          onChange={onSubsetChange}
        />
      </CustomFormRow>

      {subset && (
        <CustomFormRow
          label="Query expression"
          labelAppend={
            <EuiText size="xs">
              <EuiLink href={DSL_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                learn more about query-dsl
              </EuiLink>
            </EuiText>
          }
        >
          <JSONEditor
            mode="json"
            width="100%"
            value={queryJsonString}
            onChange={onQueryJsonChange}
            aria-label="Query DSL Editor"
            height="150px"
            data-test-subj="queryJsonEditor"
          />
        </CustomFormRow>
      )}

      <CustomFormRow
        label="How to handle conflicts"
        fullWidth={true}
        helpText="Set to proceed to continue reindexing even if there are conflicts. Defaults to abort"
      >
        <EuiRadioGroup
          options={[
            {
              id: "proceed",
              label: "proceed",
            },
            {
              id: "abort",
              label: "abort",
            },
          ]}
          idSelected={conflicts}
          onChange={onConflictsChange}
          name="conflicts group"
        />
      </CustomFormRow>

      <EuiSpacer size="m" />

      <CustomFormRow
        isInvalid={!!sliceErr}
        error={sliceErr}
        fullWidth={true}
        label="Slices"
        helpText="Number of sub-tasks OpenSearch should divide this task into. Default is 1, which means OpenSearch should not divide this task. Setting this parameter to auto indicates to OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText data-test-subj="slices" value={slices} onChange={onSlicesChange} />
      </CustomFormRow>

      <EuiSpacer size="m" />
      <CustomFormRow label="Pipeline" helpText="Pipeline pre-process documents before writing into destination">
        <EuiComboBox
          aria-label="Ingest Pipeline"
          placeholder="Select a single pipeline"
          data-test-subj="pipelineCombobox"
          singleSelection={{ asPlainText: true }}
          options={pipelines}
          selectedOptions={selectedPipelines}
          onChange={onSelectedPipelinesChange}
        />
      </CustomFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
