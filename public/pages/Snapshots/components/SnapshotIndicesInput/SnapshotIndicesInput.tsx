/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiSpacer } from "@elastic/eui";
import React from "react";
import { IndexItem } from "../../../../../models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";

interface SnapshotIndicesProps {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  onIndicesSelectionChange: (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => void;
  getIndexOptions: (searchValue: string) => void;
  onCreateOption: (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  selectedRepoValue: string;
  isClearable: boolean;
}

const SnapshotIndicesInput = ({
  indexOptions,
  selectedIndexOptions,
  onIndicesSelectionChange,
  getIndexOptions,
  onCreateOption,
}: SnapshotIndicesProps) => {
  return (
    <>
      <CustomLabel title="Select or input source indexes or index patterns" />
      <EuiComboBox
        placeholder="Select or input indexes or index patterns"
        options={indexOptions}
        selectedOptions={selectedIndexOptions}
        onChange={onIndicesSelectionChange}
        onSearchChange={getIndexOptions}
        onCreateOption={onCreateOption}
        isClearable={true}
      />

      <EuiSpacer size="m" />
    </>
  );
};

export default SnapshotIndicesInput;
