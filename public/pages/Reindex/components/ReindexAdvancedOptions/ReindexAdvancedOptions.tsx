/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import { EuiCheckbox, EuiComboBox, EuiComboBoxOptionOption, EuiFieldNumber, EuiLink, EuiRadioGroup, EuiSpacer } from "@elastic/eui";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

interface ReindexOptionsProps {
  slices?: string;
  onSlicesChange: (val?: string) => void;
  sliceErr?: string;
  selectedPipelines?: EuiComboBoxOptionOption[];
  onSelectedPipelinesChange: (options: EuiComboBoxOptionOption[]) => void;
  getAllPipelines: () => Promise<EuiComboBoxOptionOption[]>;
  ignoreConflicts: boolean;
  onIgnoreConflictsChange: (val: ChangeEvent<HTMLInputElement>) => void;
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
    ignoreConflicts,
    onIgnoreConflictsChange,
  } = props;

  const sliceEnabled = slices !== undefined;
  const sliceOption = slices === "auto" ? "auto" : "manual";
  const showSliceInput = sliceEnabled && sliceOption === "manual";

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
      <CustomFormRow
        label="Version conflicts"
        helpText={
          <>
            Instead of failing the reindexing operation, ignore any version conflicts during the reindexing.
            <EuiLink href={coreServices.docLinks.links.opensearch.reindexData.unique} target="_blank">
              Learn more.
            </EuiLink>
          </>
        }
      >
        <EuiCheckbox
          id="ConflictsOptionCheckbox"
          label="Ignore conflicts during reindexing"
          checked={ignoreConflicts}
          onChange={onIgnoreConflictsChange}
        />
      </CustomFormRow>
      <EuiSpacer />

      <CustomFormRow label="Slice reindex operation" helpText="Divide this reindexing operation into smaller subtasks to run in parallel.">
        <>
          <EuiCheckbox
            id="sliceEnabledCheckBox"
            data-test-subj="sliceEnabled"
            label="Slice this reindex operation"
            checked={sliceEnabled}
            onChange={(e) => {
              onSlicesChange(e.target.checked ? "auto" : undefined);
            }}
          />

          <EuiSpacer />

          {sliceEnabled ? (
            <EuiRadioGroup
              options={[
                {
                  id: "auto",
                  label: "Automatic",
                },
                {
                  id: "manual",
                  label: "Manually slice into subtasks",
                },
              ]}
              idSelected={sliceOption}
              onChange={(id) => {
                onSlicesChange(id === "auto" ? "auto" : "");
              }}
              name="sliceOption"
              data-test-subj="sliceOption"
            />
          ) : (
            ""
          )}
        </>
      </CustomFormRow>

      {showSliceInput ? (
        <CustomFormRow
          isInvalid={!!sliceErr}
          error={sliceErr}
          label="Number of subtasks"
          helpText="Specify how many subtasks you would like this operation divided into."
        >
          <EuiFieldNumber
            data-test-subj="slices"
            value={slices}
            placeholder="Specify a number"
            type="number"
            min={2}
            onChange={(e) => onSlicesChange(e.target.value)}
          />
        </CustomFormRow>
      ) : (
        ""
      )}

      <EuiSpacer />
      <CustomFormRow
        label={
          <>
            Transform with ingest pipeline – <i>optional</i>
          </>
        }
        helpText={
          <>
            Select an ingest pipeline if you need to transform documents before writing data into the destination index.
            <EuiLink href={coreServices.docLinks.links.opensearch.reindexData.transform} target="_blank">
              Learn more.
            </EuiLink>
          </>
        }
      >
        <EuiComboBox
          aria-label="Ingest Pipeline"
          placeholder="Select an ingest pipeline"
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
