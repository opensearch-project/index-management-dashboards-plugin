/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBoxOptionOption,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiAccordion,
} from "@elastic/eui";
import _ from "lodash";
import React, { Component, ChangeEvent } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { CatRepository, GetSnapshot } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import SnapshotRestoreAdvancedOptions from "../SnapshotRestoreAdvancedOptions";
import SnapshotRestoreOption from "../SnapshotRestoreOption";
import SnapshotRenameOptions from "../SnapshotRenameOptions";
import AddPrefixInput from "../AddPrefixInput";
// import SnapshotIndicesRepoInput from "../../../CreateSnapshotPolicy/components/SnapshotIndicesRepoInput";
import SnapshotIndicesInput from "../SnapshotIndicesInput";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";

interface RestoreSnapshotProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  restoreSnapshot: (snapshotId: string, repository: string, options: object) => void;
  snapshotId: string;
}

interface RestoreSnapshotState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  renameIndices: string;
  prefix: string;

  repositories: CatRepository[];
  selectedRepoValue: string;

  snapshot: GetSnapshot | null;
  snapshotId: string;
  restoreSpecific: boolean;
  restoreAliases: boolean;
  partial: boolean;

  repoError: string;
  snapshotIdError: string;
}

export default class RestoreSnapshotFlyout extends Component<RestoreSnapshotProps, RestoreSnapshotState> {
  static contextType = CoreServicesContext;
  constructor(props: RestoreSnapshotProps) {
    super(props);
    this.state = {
      indexOptions: [],
      selectedIndexOptions: [],
      renameIndices: "add_prefix",
      prefix: "",
      repositories: [],
      selectedRepoValue: "",
      snapshot: null,
      snapshotId: "",
      restoreSpecific: false,
      restoreAliases: true,
      partial: false,
      repoError: "",
      snapshotIdError: "",
    };
  }

  async componentDidMount() {
    await this.getRepos();
    await this.getIndexOptions();
  }

  onClickAction = () => {
    const { restoreSnapshot, snapshotId } = this.props;
    const { selectedRepoValue, selectedIndexOptions, snapshot, partial, prefix } = this.state;
    const selectedIndices = selectedIndexOptions.map((option) => option.label).join(",");
    const options = {
      indices: selectedIndices,
      ignore_unavailable: snapshot?.ignore_unavailable || false,
      include_global_state: snapshot?.include_global_state,
      rename_pattern: snapshot?.rename_pattern || "",
      rename_replacement: snapshot?.rename_replacement || "",
      include_aliases: snapshot?.restore_aliases || false,
      partial: snapshot?.partial || false,
    };
    let repoError = "";

    if (!snapshotId.trim()) {
      this.setState({ snapshotIdError: "Required" });

      return;
    }
    if (!selectedRepoValue) {
      repoError = ERROR_PROMPT.REPO;
      this.setState({ repoError });

      return;
    }
    console.log("to reqest", [snapshotId, selectedRepoValue, options]);
    restoreSnapshot(snapshotId, selectedRepoValue, options);
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    let newJSON = this.state.snapshot;
    newJSON!.indices = [...selectedIndexOptions];
    this.setState({ snapshot: newJSON, selectedIndexOptions: selectedOptions });
  };

  getSnapshot = async (snapshotId: string, repository: string) => {
    const { snapshotManagementService } = this.props;

    try {
      const response = await snapshotManagementService.getSnapshot(snapshotId, repository);

      if (response.ok) {
        const newOptions = response.response.indices.map((index) => {
          return { label: index };
        });
        this.setState({ snapshot: response.response, indexOptions: [...newOptions] });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshot."));
    }
  };

  getIndexOptions = () => {
    this.getSnapshot(this.props.snapshotId, this.state.selectedRepoValue);
  };

  onCreateOption = (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };
    // Create the option if it doesn't exist.
    if (options.findIndex((option) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      this.setState({ indexOptions: [...this.state.indexOptions, newOption] });
    }

    const selectedIndexOptions = [...this.state.selectedIndexOptions, newOption];
    this.setState({ selectedIndexOptions: selectedIndexOptions });
  };

  getRepos = async () => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.catRepositories();
      if (response.ok) {
        const selectedRepoValue = response.response.length > 0 ? response.response[0].id : "";
        this.setState({ repositories: response.response, selectedRepoValue });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    }
  };

  getPrefix = (prefix: string) => {
    this.setState({ prefix: prefix });
  };

  onToggle = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "restore_specific_indices") {
      this.setState({ restoreSpecific: true, snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }
    if (e.target.id === "restore_all_indices") {
      this.setState({ restoreSpecific: false, snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }
    if (e.target.name === "rename_option") {
      this.setState({ renameIndices: e.target.id, snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }

    this.setState({ snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const { indexOptions, selectedIndexOptions, selectedRepoValue, restoreSpecific, snapshot, renameIndices } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">Restore snapshot</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="Snapshot name" />
          <h3>{snapshotId}</h3>

          <EuiSpacer size="xxl" />

          <SnapshotRestoreOption
            restoreAllIndices={!restoreSpecific}
            onRestoreAllIndicesToggle={this.onToggle}
            restoreSpecificIndices={restoreSpecific}
            onRestoreSpecificIndicesToggle={this.onToggle}
            width="200%"
          />

          <EuiSpacer size="l" />

          {restoreSpecific && (
            <SnapshotIndicesInput
              indexOptions={indexOptions}
              selectedIndexOptions={selectedIndexOptions}
              onIndicesSelectionChange={this.onIndicesSelectionChange}
              getIndexOptions={this.getIndexOptions}
              onCreateOption={this.onCreateOption}
              selectedRepoValue={selectedRepoValue}
              isClearable={true}
            />
          )}

          <EuiSpacer size="l" />

          <SnapshotRenameOptions
            doNotRename={renameIndices === "do_not_rename"}
            onDoNotRenameToggle={this.onToggle}
            addPrefix={renameIndices === "add_prefix"}
            onAddPrefixToggle={this.onToggle}
            renameIndices={renameIndices === "rename_indices"}
            onRenameIndicesToggle={this.onToggle}
            width="200%"
          />

          {renameIndices === "add_prefix" && <AddPrefixInput getPrefix={this.getPrefix} />}

          <EuiSpacer size="xxl" />
          <EuiAccordion id="advanced_restore_options" buttonContent="Advanced options">
            <EuiSpacer size="m" />

            <SnapshotRestoreAdvancedOptions
              restoreAliases={String(_.get(snapshot, "restore_aliases", false)) == "true"}
              onRestoreAliasesToggle={this.onToggle}
              restoreClusterState={String(_.get(snapshot, "include_global_state", false)) == "true"}
              onRestoreClusterStateToggle={this.onToggle}
              ignoreUnavailable={String(_.get(snapshot, "ignore_unavailable", false)) == "true"}
              onIgnoreUnavailableToggle={this.onToggle}
              restorePartial={String(_.get(snapshot, "partial", false)) == "true"}
              onRestorePartialToggle={this.onToggle}
              customizeIndexSettings={String(_.get(snapshot, "customize_index_settings", false)) == "true"}
              onCustomizeIndexSettingsToggle={this.onToggle}
              ignoreIndexSettings={String(_.get(snapshot, "ignore_index_settings", false)) == "true"}
              onIgnoreIndexSettingsToggle={this.onToggle}
              width="200%"
            />
          </EuiAccordion>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter edit={true} restore={true} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
