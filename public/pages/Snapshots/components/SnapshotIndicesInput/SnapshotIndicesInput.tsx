/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

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
