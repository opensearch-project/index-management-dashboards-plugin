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
import { RESTORE_OPTIONS } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { CatRepository, GetSnapshot, CatSnapshotIndex } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import SnapshotRestoreAdvancedOptions from "../SnapshotRestoreAdvancedOptions";
import SnapshotRestoreOption from "../SnapshotRestoreOption";
import SnapshotRenameOptions from "../SnapshotRenameOptions";
import AddPrefixInput from "../AddPrefixInput";
import RenameInput from "../RenameInput";
import SnapshotIndicesInput from "../SnapshotIndicesInput";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";

interface RestoreSnapshotProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  restoreSnapshot: (snapshotId: string, repository: string, options: object) => void;
  snapshotId: string;
  repository: string;
}

interface RestoreSnapshotState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  renameIndices: string;
  prefix: string;
  renamePattern: string;
  renameReplacement: string;
  listIndices: boolean;
  customIndexSettings: string;
  ignoreIndexSettings?: string;
  indicesList: CatSnapshotIndex[];
  selectedRepoValue: string;
  repositories: CatRepository[];
  snapshot: GetSnapshot | null;
  snapshotId: string;
  restoreSpecific: boolean;
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
      renamePattern: "",
      renameReplacement: "",
      listIndices: false,
      customIndexSettings: "",
      ignoreIndexSettings: "",
      indicesList: [],
      repositories: [],
      selectedRepoValue: "",
      snapshot: null,
      snapshotId: "",
      restoreSpecific: false,
      partial: false,
      repoError: "",
      snapshotIdError: "",
    };
  }

  async componentDidMount() {
    await this.getIndexOptions();
  }

  onClickAction = () => {
    const { restoreSnapshot, snapshotId, repository } = this.props;
    const {
      selectedRepoValue,
      customIndexSettings,
      ignoreIndexSettings,
      restoreSpecific,
      selectedIndexOptions,
      indexOptions,
      snapshot,
      renameIndices,
      prefix,
      renamePattern,
      renameReplacement,
    } = this.state;
    const { add_prefix } = RESTORE_OPTIONS;
    const selectedIndices = selectedIndexOptions.map((option) => option.label).join(",");
    const allIndices = indexOptions.map((option) => option.label).join(",");
    // TODO replace unintelligible regex below with (.+) and add $1 to user provided prefix then add that to renameReplacement
    const pattern = renameIndices === add_prefix ? "(?<![^ ])(?=[^ ])" : renamePattern;

    const options = {
      indices: restoreSpecific ? selectedIndices : allIndices,
      index_settings: customIndexSettings.length ? JSON.parse(customIndexSettings) : "",
      ignore_index_settings: ignoreIndexSettings,
      ignore_unavailable: snapshot?.ignore_unavailable || false,
      include_global_state: snapshot?.include_global_state,
      rename_pattern: pattern,
      rename_replacement: renameIndices === add_prefix ? prefix : renameReplacement,
      include_aliases: snapshot?.restore_aliases ? snapshot.restore_aliases : true,
      partial: snapshot?.partial || false,
    };
    let repoError = "";

    if (!options.index_settings) {
      delete options.index_settings;
    }
    if (!options.ignore_index_settings) {
      delete options.ignore_index_settings;
    }
    if (!snapshotId.trim()) {
      this.setState({ snapshotIdError: "Required." });

      return;
    }
    if (!repository) {
      repoError = ERROR_PROMPT.REPO;
      this.setState({ repoError });

      return;
    }
    restoreSnapshot(snapshotId, repository, options);
  };

  onClickIndices = () => {
    this.setState({ listIndices: true });
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
    this.getSnapshot(this.props.snapshotId, this.props.repository);
  };

  getIndexSettings = (indexSettings: string) => {
    const { snapshot } = this.state;
    const ignore = snapshot?.ignore_index_settings ? snapshot.ignore_index_settings : false;

    !ignore && this.setState({ customIndexSettings: indexSettings });
    ignore && this.setState({ ignoreIndexSettings: indexSettings });
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

  getPrefix = (prefix: string) => {
    this.setState({ prefix: prefix });
  };

  getRenamePattern = (renamePattern: string) => {
    this.setState({ renamePattern: renamePattern });
  };

  getRenameReplacement = (renameReplacement: string) => {
    this.setState({ renameReplacement: renameReplacement });
  };

  onToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const { restore_specific_indices, restore_all_indices } = RESTORE_OPTIONS;

    if (e.target.id === restore_specific_indices) {
      this.setState({ restoreSpecific: true, snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }
    if (e.target.id === restore_all_indices) {
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
    const { onCloseFlyout, repository } = this.props;
    const { indexOptions, selectedIndexOptions, restoreSpecific, snapshot, renameIndices } = this.state;

    const {
      do_not_rename,
      add_prefix,
      rename_indices,
      restore_aliases,
      include_global_state,
      ignore_unavailable,
      partial,
      customize_index_settings,
      ignore_index_settings,
    } = RESTORE_OPTIONS;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">Restore snapshot</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <EuiFlexGroup>
            <EuiFlexItem>
              <CustomLabel title="Snapshot name" />
              <h3>{snapshot?.snapshot}</h3>
            </EuiFlexItem>
            <EuiFlexItem>
              <CustomLabel title="Status" />
              <h3>{snapshot?.state}</h3>
            </EuiFlexItem>
            <EuiFlexItem>
              <CustomLabel title="Indices" />
              <a onClick={this.onClickIndices}>{snapshot?.indices.length}</a>
            </EuiFlexItem>
          </EuiFlexGroup>

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
              selectedRepoValue={repository}
              isClearable={true}
            />
          )}

          <EuiSpacer size="l" />

          <SnapshotRenameOptions
            doNotRename={renameIndices === do_not_rename}
            onDoNotRenameToggle={this.onToggle}
            addPrefix={renameIndices === add_prefix}
            onAddPrefixToggle={this.onToggle}
            renameIndices={renameIndices === rename_indices}
            onRenameIndicesToggle={this.onToggle}
            width="200%"
          />

          {renameIndices === add_prefix && <AddPrefixInput getPrefix={this.getPrefix} />}
          {renameIndices === rename_indices && (
            <RenameInput getRenamePattern={this.getRenamePattern} getRenameReplacement={this.getRenameReplacement} />
          )}

          <EuiSpacer size="xxl" />
          <EuiAccordion id="advanced_restore_options" buttonContent="Advanced options">
            <EuiSpacer size="m" />

            <SnapshotRestoreAdvancedOptions
              ignore={snapshot?.ignore_index_settings ? snapshot.ignore_index_settings : false}
              getIndexSettings={this.getIndexSettings}
              restoreAliases={String(_.get(snapshot, restore_aliases, true)) == "true"}
              onRestoreAliasesToggle={this.onToggle}
              restoreClusterState={String(_.get(snapshot, include_global_state, false)) == "true"}
              onRestoreClusterStateToggle={this.onToggle}
              ignoreUnavailable={String(_.get(snapshot, ignore_unavailable, false)) == "true"}
              onIgnoreUnavailableToggle={this.onToggle}
              restorePartial={String(_.get(snapshot, partial, false)) == "true"}
              onRestorePartialToggle={this.onToggle}
              customizeIndexSettings={String(_.get(snapshot, customize_index_settings, false)) == "true"}
              onCustomizeIndexSettingsToggle={this.onToggle}
              ignoreIndexSettings={String(_.get(snapshot, ignore_index_settings, false)) == "true"}
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
