/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import React from "react";
import { IndexItem } from "../../../../models/interfaces";
import CustomLabel from "./CustomLabel";

interface SnapshotIndicesProps {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  onIndicesSelectionChange: (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => void;
  getIndexOptions: (searchValue: string) => void;
  onCreateOption: (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  repoOptions: EuiSelectOption[];
  selectedRepoValue: string;
  onRepoSelectionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SnapshotIndicesRepoInput = ({
  indexOptions,
  selectedIndexOptions,
  onIndicesSelectionChange,
  getIndexOptions,
  onCreateOption,
  repoOptions,
  selectedRepoValue,
  onRepoSelectionChange,
}: SnapshotIndicesProps) => {
  return (
    <>
      <CustomLabel title="Indices" />
      <EuiComboBox
        placeholder="Select indices"
        options={indexOptions}
        selectedOptions={selectedIndexOptions}
        onChange={onIndicesSelectionChange}
        onSearchChange={getIndexOptions}
        onCreateOption={onCreateOption}
        isClearable={true}
      />

      <EuiSpacer size="m" />

      <CustomLabel title="Repository" />
      <EuiSelect
        disabled={repoOptions.length === 0}
        options={repoOptions}
        value={selectedRepoValue}
        onChange={onRepoSelectionChange}
        hasNoInitialSelection={true}
      />
    </>
  );
};

export default SnapshotIndicesRepoInput;
