/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiSpacer, EuiFormRow } from "@elastic/eui";
import React from "react";
import { IndexItem } from "../../../../../models/interfaces";

interface SnapshotIndicesInputProps {
  indexOptions: Array<EuiComboBoxOptionOption<IndexItem>>;
  selectedIndexOptions: Array<EuiComboBoxOptionOption<IndexItem>>;
  onIndicesSelectionChange: (selectedOptions: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  getIndexOptions: (searchValue: string) => void;
  onCreateOption: (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  selectedRepoValue: string;
  showError: boolean;
  isClearable: boolean;
}

const SnapshotIndicesInput = ({
  indexOptions,
  selectedIndexOptions,
  onIndicesSelectionChange,
  getIndexOptions,
  onCreateOption,
  showError,
}: SnapshotIndicesInputProps) => {
  const selectionError = "You must select at least one index to restore.";

  return (
    <>
      <EuiFormRow label="Select indices or input index patterns you want to restore" error={selectionError} isInvalid={showError}>
        <EuiComboBox
          isInvalid={showError}
          placeholder="Select indices or input index patterns."
          options={indexOptions}
          selectedOptions={selectedIndexOptions}
          onChange={onIndicesSelectionChange}
          onSearchChange={getIndexOptions}
          onCreateOption={onCreateOption}
          isClearable={true}
        />
      </EuiFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default SnapshotIndicesInput;
