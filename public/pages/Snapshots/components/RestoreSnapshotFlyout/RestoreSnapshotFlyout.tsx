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
  EuiCompressedCheckbox,
  EuiCallOut,
  EuiText,
} from "@elastic/eui";
import _ from "lodash";
import React, { Component, ChangeEvent, useContext } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { checkBadJSON, checkBadRegex, checkBadReplacement, checkCustomIgnoreConflict, checkNoSelectedIndices } from "../../helper";
import { browseIndicesCols } from "../../../../utils/constants";
import { ERROR_TOAST_TITLE } from "../../constants";
import { IndexItem } from "../../../../../models/interfaces";
import { CatRepository, GetSnapshot } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import SnapshotRestoreAdvancedOptions from "../SnapshotRestoreAdvancedOptions";
import SnapshotRestoreOption from "../SnapshotRestoreOption";
import SnapshotRenameOptions from "../SnapshotRenameOptions";
import AddPrefixInput from "../AddPrefixInput";
import RenameInput from "../RenameInput";
import SnapshotIndicesInput from "../SnapshotIndicesInput";
import IndexList from "../IndexList";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";

interface RestoreSnapshotProps extends DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  getRestoreTime: (time: number) => void;
  restoreSnapshot: (snapshotId: string, repository: string, options: object) => void;
  snapshotId: string;
  repository: string;
}

interface RestoreSnapshotState extends DataSourceMenuProperties {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  renameIndices: string;
  prefix: string;
  renamePattern: string;
  renameReplacement: string;
  listIndices: boolean;
  customIndexSettings?: string;
  ignoreIndexSettings?: string;
  indicesList: string[];
  selectedRepoValue: string;
  repositories: CatRepository[];
  snapshot: GetSnapshot | null;
  restoreSpecific: boolean;
  partial: boolean;
  badPattern: boolean;
  badRename: boolean;
  badJSON: boolean;
  badIgnore: boolean;
  repoError: string;
  noIndicesSelected: boolean;
  snapshotIdError: string;
}

export class RestoreSnapshotFlyout extends MDSEnabledComponent<RestoreSnapshotProps, RestoreSnapshotState> {
  static contextType = CoreServicesContext;
  constructor(props: RestoreSnapshotProps) {
    super(props);
    this.state = {
      ...this.state,
      indexOptions: [],
      selectedIndexOptions: [],
      renameIndices: "add_prefix",
      prefix: "restored_",
      renamePattern: "(.+)",
      renameReplacement: "restored_$1",
      listIndices: false,
      customIndexSettings: "",
      ignoreIndexSettings: "",
      indicesList: [],
      repositories: [],
      selectedRepoValue: "",
      snapshot: null,
      restoreSpecific: false,
      partial: false,
      badPattern: false,
      badRename: false,
      badJSON: false,
      badIgnore: false,
      noIndicesSelected: false,
      repoError: "",
      snapshotIdError: "",
    };
  }

  async componentDidMount() {
    await this.getIndexOptions();
  }

  async componentDidUpdate(prevProps: RestoreSnapshotProps, prevState: RestoreSnapshotState) {
    if (prevState.dataSourceId != this.state.dataSourceId) {
      await this.getIndexOptions();
    }
  }

  onClickAction = () => {
    const { restoreSnapshot, snapshotId, repository, onCloseFlyout, getRestoreTime } = this.props;
    const {
      customIndexSettings,
      ignoreIndexSettings,
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

    const options = {
      indices: restoreSpecific ? selectedIndices : allIndices,
      index_settings: customIndexSettings,
      ignore_index_settings: ignoreIndexSettings,
      ignore_unavailable: snapshot?.ignore_unavailable || false,
      include_global_state: snapshot?.include_global_state,
      rename_pattern: pattern,
      rename_replacement: renameIndices === add_prefix ? `${prefix}$1` : renameReplacement,
      include_aliases: snapshot?.restore_aliases ? snapshot.restore_aliases : true,
      partial: snapshot?.partial || false,
    };
    let repoError = "";

    if (options.index_settings?.length == 0) {
      delete options.index_settings;
    }

    if (options.ignore_index_settings?.length == 0) {
      delete options.ignore_index_settings;
    }

    const badJSON = options.index_settings ? checkBadJSON(options.index_settings) : false;
    const badPattern = checkBadRegex(options.rename_pattern);
    const badRename = checkBadReplacement(options.rename_replacement);
    const badIgnore = options.ignore_index_settings ? checkCustomIgnoreConflict(customIndexSettings, ignoreIndexSettings) : false;
    const noIndicesSelected = checkNoSelectedIndices(options.indices, restoreSpecific);

    if (!badIgnore && (badPattern || badRename || noIndicesSelected || badJSON)) {
      this.context.notifications.toasts.addDanger(null, { title: ERROR_TOAST_TITLE });
    }

    if (badIgnore) {
      this.context.notifications.toasts.addDanger(null, {
        title: "Cannot apply and ignore the same index settings",
        text:
          "One or more index settings was declared in both Custom index settings and Ignore index settings. Remove the index setting from either fields.",
      });
    }

    this.setState({ badPattern, badRename, badIgnore, noIndicesSelected, badJSON });

    if (badPattern || badRename || badIgnore || noIndicesSelected || badJSON) {
      return;
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

    if (options.index_settings) {
      options.index_settings = JSON.parse(options.index_settings);
    }
    getRestoreTime(Date.now());
    restoreSnapshot(snapshotId, repository, options);
    onCloseFlyout();
  };

  onClickIndices = async () => {
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
        const message = JSON.parse(response.error).error.root_cause[0].reason;
        const trimmedMessage = message.slice(message.indexOf("]") + 1, message.indexOf(".") + 1);
        this.context.notifications.toasts.addError(response.error, {
          title: `There was a problem getting the snapshot`,
          toastMessage: `${trimmedMessage} Open browser console & click below for details.`,
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

  getIndexSettings = (indexSettings: string, ignore: boolean) => {
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
    const {
      restore_specific_indices,
      restore_all_indices,
      customize_index_settings,
      ignore_index_settings,
      restore_aliases,
    } = RESTORE_OPTIONS;

    if (e.target.id === restore_specific_indices) {
      this.setState({ restoreSpecific: true, snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }

    if (e.target.id === restore_aliases) {
      this.setState({ snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked) });
      return;
    }

    if (e.target.id === restore_all_indices) {
      this.setState({
        restoreSpecific: false,
        noIndicesSelected: false,
        snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked),
      });
      return;
    }

    if (e.target.id === customize_index_settings) {
      if (!e.target.checked) {
        this.setState({ customIndexSettings: "", badJSON: false });
      }
    }

    if (e.target.id === ignore_index_settings) {
      if (!e.target.checked) {
        this.setState({ ignoreIndexSettings: "", badIgnore: false });
      }
    }

    if (e.target.name === "rename_option") {
      let renamePattern = this.state.renamePattern;
      let renameReplacement = this.state.renameReplacement;

      if (e.target.id !== "rename_indices") {
        renamePattern = "(.+)";
        renameReplacement = "restored_$1";
      }

      this.setState({
        renameIndices: e.target.id,
        renamePattern,
        badPattern: false,
        renameReplacement,
        badRename: false,
        snapshot: _.set(this.state.snapshot!, e.target.id, e.target.checked),
      });
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
      badPattern,
      badRename,
      badJSON,
      badIgnore,
      noIndicesSelected,
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
    const restoreDisabled = snapshot?.failed_shards && !snapshot?.partial;
    const snapshotIndices: IndexItem[] = snapshot?.indices.map((index) => ({ index: index }));

    return (
      <EuiFlyout ownFocus={false} maxWidth={600} onClose={onCloseFlyout} size="m" hideCloseButton>
        {listIndices ? (
          <IndexList
            indices={snapshotIndices}
            snapshot={snapshotId}
            columns={browseIndicesCols}
            onClick={this.onBackArrowClick}
            title="Indices in snapshot"
          />
        ) : (
          <>
            <EuiFlyoutHeader hasBorder>
              <EuiText size="s">
                <EuiTitle size="m">
                  <h2 id="flyoutTitle">Restore snapshot</h2>
                </EuiTitle>
              </EuiText>
            </EuiFlyoutHeader>

            <EuiFlyoutBody>
              <EuiFlexGroup alignItems="flexStart">
                <EuiFlexItem>
                  <CustomLabel title="Snapshot name" />
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>{snapshot?.snapshot}</p>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <CustomLabel title="Status" />
                  <EuiHealth textSize="m" color={`${status?.toLowerCase()}`} title={`${status} indicator icon`}>
                    {" "}
                    <EuiText size="s">
                      <p> {status}</p>
                    </EuiText>
                  </EuiHealth>
                </EuiFlexItem>
                <EuiFlexItem>
                  <CustomLabel title="Indices" />
                  <EuiSpacer size="xs" />
                  <a onClick={this.onClickIndices}>
                    <EuiText size="s">
                      <p> {snapshot?.indices.length}</p>
                    </EuiText>
                  </a>
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
                  selectedRepoValue={selectedRepoValue}
                  showError={noIndicesSelected}
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
                <RenameInput
                  getRenamePattern={this.getRenamePattern}
                  getRenameReplacement={this.getRenameReplacement}
                  showPatternError={badPattern}
                  showRenameError={badRename}
                />
              )}

              <EuiSpacer size="xxl" />
              <EuiAccordion
                id="advanced_restore_options"
                buttonContent={
                  <EuiText size="s">
                    <h3>Advanced options</h3>
                  </EuiText>
                }
              >
                <EuiSpacer size="m" />

                <SnapshotRestoreAdvancedOptions
                  getIndexSettings={this.getIndexSettings}
                  restoreAliases={String(_.get(snapshot, restore_aliases, false)) == "true"}
                  onRestoreAliasesToggle={this.onToggle}
                  restoreClusterState={String(_.get(snapshot, include_global_state, false)) == "true"}
                  onRestoreClusterStateToggle={this.onToggle}
                  ignoreUnavailable={String(_.get(snapshot, ignore_unavailable, false)) == "true"}
                  onIgnoreUnavailableToggle={this.onToggle}
                  customizeIndexSettings={String(_.get(snapshot, customize_index_settings, false)) == "true"}
                  onCustomizeIndexSettingsToggle={this.onToggle}
                  ignoreIndexSettings={String(_.get(snapshot, ignore_index_settings, false)) == "true"}
                  onIgnoreIndexSettingsToggle={this.onToggle}
                  width="200%"
                  badJSONInput={badJSON}
                  badIgnoreInput={badIgnore}
                />
              </EuiAccordion>

              <EuiSpacer size="l" />

              {snapshot?.failed_shards && (
                <EuiCallOut title="Restoring a partial snapshot" color="warning">
                  <p>
                    You are about to restore a partial snapshot. One or more shards may be missing in this
                    <br />
                    snapshot. Do you want to continue?
                  </p>
                  <EuiSpacer size="s" />
                  <EuiCompressedCheckbox
                    id={partial}
                    label={<EuiText size="s">Allow restore partial snapshots</EuiText>}
                    checked={String(_.get(snapshot, partial, false)) == "true"}
                    onChange={this.onToggle}
                  />
                </EuiCallOut>
              )}
            </EuiFlyoutBody>

            <EuiFlyoutFooter>
              <FlyoutFooter
                edit={true}
                restore={true}
                action=""
                onClickAction={this.onClickAction}
                onClickCancel={onCloseFlyout}
                disabledAction={!!restoreDisabled}
              />
            </EuiFlyoutFooter>
          </>
        )}
      </EuiFlyout>
    );
  }
}

export default function (props: Omit<RestoreSnapshotProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <RestoreSnapshotFlyout {...props} {...dataSourceMenuProps} />;
}
