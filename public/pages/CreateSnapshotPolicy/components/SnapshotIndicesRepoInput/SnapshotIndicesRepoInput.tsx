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

import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
} from "@elastic/eui";
import React from "react";
import { CreateRepositorySettings } from "../../../../../server/models/interfaces";
import { IndexItem } from "../../../../../models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import { SnapshotManagementService } from "../../../../services";
import CreateRepositoryFlyout from "../../../Repositories/components/CreateRepositoryFlyout/CreateRepositoryFlyout";

interface SnapshotIndicesProps {
  indexOptions: Array<EuiComboBoxOptionOption<IndexItem>>;
  selectedIndexOptions: Array<EuiComboBoxOptionOption<IndexItem>>;
  onIndicesSelectionChange: (selectedOptions: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  getIndexOptions: (searchValue: string) => void;
  onCreateOption: (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  repoOptions: EuiSelectOption[];
  selectedRepoValue: string;
  onRepoSelectionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  // create repository flyout
  showFlyout?: boolean;
  openFlyout?: () => void;
  closeFlyout?: () => void;
  createRepo?: (repoName: string, type: string, settings: CreateRepositorySettings) => void;
  snapshotManagementService?: SnapshotManagementService;
  repoError: string;
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
  showFlyout,
  openFlyout,
  closeFlyout,
  createRepo,
  snapshotManagementService,
  repoError,
}: SnapshotIndicesProps) => {
  let createRepoFlyout;
  if (snapshotManagementService != null && createRepo != null && closeFlyout != null) {
    createRepoFlyout = (
      <CreateRepositoryFlyout service={snapshotManagementService} editRepo={null} createRepo={createRepo} onCloseFlyout={closeFlyout} />
    );
  }

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
        data-test-subj="indicesComboBoxInput"
      />

      <EuiSpacer size="m" />

      <EuiFlexGroup alignItems="flexEnd">
        <EuiFlexItem style={{ maxWidth: "400px" }}>
          <CustomLabel title="Select a repository for snapshots" />
          <EuiFormRow isInvalid={!!repoError} error={repoError}>
            <EuiSelect
              placeholder="Select a repository"
              disabled={repoOptions.length === 0}
              options={repoOptions}
              value={selectedRepoValue}
              onChange={onRepoSelectionChange}
            />
          </EuiFormRow>
        </EuiFlexItem>

        {showFlyout != null && (
          <EuiFlexItem grow={false}>
            <EuiButton onClick={openFlyout}>Create repository</EuiButton>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>

      {showFlyout && createRepoFlyout}
    </>
  );
};

export default SnapshotIndicesRepoInput;
