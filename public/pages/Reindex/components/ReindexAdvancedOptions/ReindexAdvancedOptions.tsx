/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import { EuiComboBox, EuiComboBoxOptionOption, EuiFieldText, EuiRadioGroup, EuiSpacer } from "@elastic/eui";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sliceErr?: string;
  selectedPipelines?: EuiComboBoxOptionOption[];
  onSelectedPipelinesChange: (options: EuiComboBoxOptionOption[]) => void;
  getAllPipelines: () => Promise<EuiComboBoxOptionOption[]>;
  conflicts: string;
  onConflictsChange: (val: string) => void;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  let pipelinesInit: EuiComboBoxOptionOption[] = [];
  const [pipelines, SetPipelines] = useState(pipelinesInit);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const {
    slices,
    sliceErr,
    onSlicesChange,
    selectedPipelines,
    onSelectedPipelinesChange,
    getAllPipelines,
    conflicts,
    onConflictsChange,
  } = props;

  useEffect(() => {
    getAllPipelines()
      .then((pipelines) => {
        SetPipelines(pipelines);
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch pipelines error ${err}`);
      });
  }, [coreServices, getAllPipelines]);

  return (
    <div style={{ padding: "10px 10px" }}>
      <CustomFormRow label="Specify conflicts option" helpText="Set to proceed to continue reindexing even if there are conflicts.">
        <EuiRadioGroup
          options={[
            {
              id: "proceed",
              label: "Continue to proceed reindexing",
            },
            {
              id: "abort",
              label: "Abort reindexing",
            },
          ]}
          idSelected={conflicts}
          onChange={onConflictsChange}
          name="conflicts group"
        />
      </CustomFormRow>

      <EuiSpacer />

      <CustomFormRow
        isInvalid={!!sliceErr}
        error={sliceErr}
        label="Slices"
        helpText="Number of sub-tasks OpenSearch should divide this task into. Default is 1, which means OpenSearch should not divide this task. Setting this parameter to auto indicates to OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText data-test-subj="slices" value={slices} onChange={onSlicesChange} />
      </CustomFormRow>

      <EuiSpacer />
      <CustomFormRow label="Pipeline" helpText="Pipeline pre-process documents before writing into destination.">
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
