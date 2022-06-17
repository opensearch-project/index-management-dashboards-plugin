/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
import { CreateRepositorySettings } from "../../../../server/models/interfaces";
import React from "react";
import { IndexItem } from "../../../../models/interfaces";
import CreateRepositoryFlyout from "./CreateRepositoryFlyout";
import CustomLabel from "./CustomLabel";
import { SnapshotManagementService } from "../../../services";

interface SnapshotIndicesProps {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  onIndicesSelectionChange: (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => void;
  getIndexOptions: (searchValue: string) => void;
  onCreateOption: (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => void;
  repoOptions: EuiSelectOption[];
  selectedRepoValue: string;
  onRepoSelectionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
      <CustomLabel title="Indices" />
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

      <EuiFlexGroup alignItems="flexEnd">
        <EuiFlexItem style={{ maxWidth: "400px" }}>
          <CustomLabel title="Repository" />
          <EuiFormRow isInvalid={!!repoError} error={repoError}>
            <EuiSelect
              placeholder="Select a repository"
              disabled={repoOptions.length === 0}
              options={repoOptions}
              value={selectedRepoValue}
              onChange={onRepoSelectionChange}
              hasNoInitialSelection={true}
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
