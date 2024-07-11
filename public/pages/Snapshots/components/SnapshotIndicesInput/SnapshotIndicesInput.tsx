/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedComboBox, EuiComboBoxOptionOption, EuiSpacer, EuiCompressedFormRow } from "@elastic/eui";
import React from "react";
import { IndexItem } from "../../../../../models/interfaces";

interface SnapshotIndicesInputProps {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  onIndicesSelectionChange: (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => void;
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
      <EuiCompressedFormRow label="Select indices or input index patterns you want to restore" error={selectionError} isInvalid={showError}>
        <EuiCompressedComboBox
          isInvalid={showError}
          placeholder="Select indices or input index patterns."
          options={indexOptions}
          selectedOptions={selectedIndexOptions}
          onChange={onIndicesSelectionChange}
          onSearchChange={getIndexOptions}
          onCreateOption={onCreateOption}
          isClearable={true}
        />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default SnapshotIndicesInput;
