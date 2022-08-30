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
  EuiRadioGroup,
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
import SnapshotIndicesRepoInput from "../../../CreateSnapshotPolicy/components/SnapshotIndicesRepoInput";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";

interface RestoreSnapshotProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  restoreSnapshot: (snapshotId: string, repository: string) => void;
  snapshotId: string;
}

interface RestoreSnapshotState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];

  repositories: CatRepository[];
  selectedRepoValue: string;

  snapshot: GetSnapshot | null;
  snapshotId: string;

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
      repositories: [],
      selectedRepoValue: "",
      snapshot: null,
      snapshotId: "",
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
    const { selectedRepoValue } = this.state;
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
    restoreSnapshot(snapshotId, selectedRepoValue);
    this.setState({ indexOptions: [] });
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    let newJSON = this.state.snapshot;

    this.setState({ snapshot: newJSON, selectedIndexOptions: selectedOptions });
  };

  getSnapshot = async (snapshotId: string, repository: string) => {
    console.log("flyout", [repository, snapshotId]);
    console.log("repositories", [...this.state.repositories]);
    const { snapshotManagementService } = this.props;
    try {
      const response = await snapshotManagementService.getSnapshot(snapshotId, repository);
      console.log("my response", response);
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

  onRepoSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepo = e.target.value;
    let repoError = "";
    if (!selectedRepo) {
      repoError = ERROR_PROMPT.REPO;
    }
    this.setState({ selectedRepoValue: selectedRepo, repoError });
  };

  onRestoreAliasesToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "restore_aliases", e.target.checked) });
  };

  onRestoreClusterStateToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "restore_cluster_state", e.target.checked) });
  };

  onIgnoreUnavailableToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "ignore_unavailable", e.target.checked) });
  };

  onRestorePartialToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "restore_partial", e.target.checked) });
  };

  onCustomizeIndexSettingsToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "customize_index_settings", e.target.checked) });
  };

  onIgnoreIndexSettingsToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot!, "ignore_index_settings", e.target.checked) });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const { indexOptions, selectedIndexOptions, repositories, selectedRepoValue, restoreSpecific, repoError, snapshot } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

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

          <EuiSpacer size="m" />

          {restoreSpecific && (
            <SnapshotIndicesRepoInput
              indexOptions={indexOptions}
              selectedIndexOptions={selectedIndexOptions}
              onIndicesSelectionChange={this.onIndicesSelectionChange}
              getIndexOptions={this.getIndexOptions}
              onCreateOption={this.onCreateOption}
              repoOptions={repoOptions}
              selectedRepoValue={selectedRepoValue}
              onRepoSelectionChange={this.onRepoSelectionChange}
              repoError={repoError}
            />
          )}
          <EuiSpacer size="xxl" />

          <EuiAccordion id="advanced_restore_options" buttonContent="Advanced options">
            <EuiSpacer size="m" />

            <SnapshotRestoreAdvancedOptions
              restoreAliases={String(_.get(snapshot, "restore_aliases", false)) == "true"}
              onRestoreAliasesToggle={this.onRestoreAliasesToggle}
              restoreClusterState={String(_.get(snapshot, "restore_cluster_state", false)) == "true"}
              onRestoreClusterStateToggle={this.onRestoreClusterStateToggle}
              ignoreUnavailable={String(_.get(snapshot, "ignore_unavailable", false)) == "true"}
              onIgnoreUnavailableToggle={this.onIgnoreUnavailableToggle}
              restorePartial={String(_.get(snapshot, "restore_partial", false)) == "true"}
              onRestorePartialToggle={this.onRestorePartialToggle}
              customizeIndexSettings={String(_.get(snapshot, "customize_index_settings", false)) == "true"}
              onCustomizeIndexSettingsToggle={this.onCustomizeIndexSettingsToggle}
              ignoreIndexSettings={String(_.get(snapshot, "ignore_index_settings", false)) == "true"}
              onIgnoreIndexSettingsToggle={this.onIgnoreIndexSettingsToggle}
              width="200%"
            />
          </EuiAccordion>

          <EuiSpacer size="l" />
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter edit={false} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
