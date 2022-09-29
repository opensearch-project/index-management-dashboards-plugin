/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBoxOptionOption,
  EuiHealth,
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
import IndexList from "../IndexList";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";

interface RestoreSnapshotProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  getRestoreInfo: (time: number, count: number) => void
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
  indicesList: CatSnapshotIndex[];
  repositories: CatRepository[],
  selectedRepoValue: string,
  snapshot: GetSnapshot | null;
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
      prefix: "restored_",
      renamePattern: "",
      renameReplacement: "",
      listIndices: false,
      indicesList: [],
      repositories: [],
      selectedRepoValue: "",
      snapshot: null,
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
    const { restoreSnapshot, snapshotId, repository, onCloseFlyout, getRestoreInfo } = this.props;
    const {
      restoreSpecific,
      selectedIndexOptions,
      indexOptions,
      renameIndices,
      prefix,
      snapshot,
      renamePattern,
      renameReplacement,
    } = this.state;
    const { add_prefix } = RESTORE_OPTIONS;
    const selectedIndices = selectedIndexOptions.map((option) => option.label).join(",");
    const allIndices = indexOptions.map((option) => option.label).join(",");
    const pattern = renameIndices === add_prefix ? "(.+)" : renamePattern;
    const restoreCount = restoreSpecific ? selectedIndexOptions.length : indexOptions.length;

    const options = {
      indices: restoreSpecific ? selectedIndices : allIndices,
      ignore_unavailable: snapshot?.ignore_unavailable || false,
      include_global_state: snapshot?.include_global_state,
      rename_pattern: pattern,
      rename_replacement: renameIndices === add_prefix ? `${prefix}$1` : renameReplacement,
      include_aliases: snapshot?.restore_aliases ? snapshot.restore_aliases : true,
      partial: snapshot?.partial || false,
    };
    let repoError = "";

    if (!snapshotId.trim()) {
      this.setState({ snapshotIdError: "Required." });

      return;
    }
    if (!repository) {
      repoError = ERROR_PROMPT.REPO;
      this.setState({ repoError });

      return;
    }

    getRestoreInfo(Date.now(), restoreCount);
    restoreSnapshot(snapshotId, repository, options);
    onCloseFlyout()
  };

  onClickIndices = async () => {
    const { snapshot } = this.state;
    const indices = snapshot!.indices.join(",");

    await this.getSnapshotIndices(indices);
    this.setState({ listIndices: true });
  };

  onBackArrowClick = () => {
    this.setState({ listIndices: false });
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
      } else {
        const message = JSON.parse(response.error).error.root_cause[0].reason
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem getting the snapshot`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`
        });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshot."));
    }
  };

  getIndexOptions = () => {
    const { snapshotId, repository } = this.props;

    this.getSnapshot(snapshotId, repository);
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

  getSnapshotIndices = async (indices: string) => {
    try {
      const { snapshot } = this.state;
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.catSnapshotIndices(indices);
      const activeIndexNames: string[] = [];

      const indexNames = snapshot?.indices
      if (response.ok) {
        let indicesResponse = response.response;
        let currIndices = indicesResponse.filter((resItem: CatSnapshotIndex) => {
          if (indexNames!.includes(resItem.index)) {
            activeIndexNames.push(resItem.index);
            return resItem;
          }
        });
        const formattedIndices = currIndices.map((index) => ({ index: index.index, ["store.size"]: index["store.size"] }))
        const inactiveIndices = snapshot?.indices.filter((index) => !activeIndexNames.includes(index) && index.length && index.indexOf("kibana") < 0)
          .map((index) => ({ index: index, "store.size": "unknown" }));

        this.setState({ indicesList: [...formattedIndices, ...inactiveIndices] });
      } else {
        const message = JSON.parse(response.error).error.root_cause[0].reason
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem loading the indices for this snapshot`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`
        });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the indices for this snapshot."));
    }
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
    const { onCloseFlyout, snapshotId } = this.props;
    const {
      indexOptions,
      selectedIndexOptions,
      selectedRepoValue,
      restoreSpecific,
      snapshot,
      renameIndices,
      listIndices,
      indicesList,
    } = this.state;

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

    const status = snapshot ? snapshot?.state[0] + snapshot?.state.slice(1).toLowerCase() : undefined;

    return (
      <EuiFlyout ownFocus={false} maxWidth={600} onClose={onCloseFlyout} size="m" hideCloseButton>
        {listIndices && <IndexList indices={indicesList} snapshot={snapshotId} onClick={this.onBackArrowClick} title="Indices in snapshot" />}
        {listIndices || (
          <>
            <EuiFlyoutHeader hasBorder>
              <EuiTitle size="m">
                <h2 id="flyoutTitle">Restore snapshot</h2>
              </EuiTitle>
            </EuiFlyoutHeader>

            <EuiFlyoutBody>

              <EuiFlexGroup alignItems="flexStart">
                <EuiFlexItem>
                  <CustomLabel title="Snapshot name" />
                  <EuiSpacer size="xs" />
                  <h3 style={{ fontSize: "1.1rem" }}>{snapshot?.snapshot}</h3>
                </EuiFlexItem>
                <EuiFlexItem>
                  <CustomLabel title="Status" />
                  <EuiHealth textSize="m" color={`${status?.toLowerCase()}`} title={`${status} indicator icon`}> {status}</EuiHealth>
                </EuiFlexItem>
                <EuiFlexItem>
                  <CustomLabel title="Indices" />
                  <EuiSpacer size="xs" />
                  <a onClick={this.onClickIndices} style={{ fontSize: "1.1rem" }}>{snapshot?.indices.length}</a>
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

              {
                restoreSpecific && (
                  <SnapshotIndicesInput
                    indexOptions={indexOptions}
                    selectedIndexOptions={selectedIndexOptions}
                    onIndicesSelectionChange={this.onIndicesSelectionChange}
                    getIndexOptions={this.getIndexOptions}
                    onCreateOption={this.onCreateOption}
                    selectedRepoValue={selectedRepoValue}
                    isClearable={true}
                  />
                )
              }

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
              {
                renameIndices === rename_indices && (
                  <RenameInput getRenamePattern={this.getRenamePattern} getRenameReplacement={this.getRenameReplacement} />
                )
              }

              <EuiSpacer size="xxl" />
              <EuiAccordion id="advanced_restore_options" buttonContent="Advanced options">
                <EuiSpacer size="m" />

                <SnapshotRestoreAdvancedOptions
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
            </EuiFlyoutBody >

            <EuiFlyoutFooter>
              <FlyoutFooter edit={true} restore={true} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
            </EuiFlyoutFooter>
          </>
        )
        }
      </EuiFlyout>
    );
  }
}
