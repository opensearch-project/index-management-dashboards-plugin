/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiFormHelpText,
} from "@elastic/eui";
import _ from "lodash";

import React, { Component, useContext } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { getErrorMessage, wildcardOption } from "../../../../utils/helpers";
import { IndexItem, Snapshot } from "../../../../../models/interfaces";
import { CatRepository } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import SnapshotAdvancedSettings from "../../../CreateSnapshotPolicy/components/SnapshotAdvancedSettings";
import SnapshotIndicesRepoInput from "../../../CreateSnapshotPolicy/components/SnapshotIndicesRepoInput";
import { ChangeEvent } from "react";
import { getEmptySnapshot } from "./constants";
import { ERROR_PROMPT } from "../../../CreateSnapshotPolicy/constants";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";

interface CreateSnapshotProps extends DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  createSnapshot: (snapshotId: string, repository: string, snapshot: Snapshot) => void;
}

interface CreateSnapshotState extends DataSourceMenuProperties {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];

  repositories: CatRepository[];
  selectedRepoValue: string;

  snapshot: Snapshot;
  snapshotId: string;

  repoError: string;
  snapshotIdError: string;
}

export class CreateSnapshotFlyout extends MDSEnabledComponent<CreateSnapshotProps, CreateSnapshotState> {
  static contextType = CoreServicesContext;
  constructor(props: CreateSnapshotProps) {
    super(props);

    this.state = {
      ...this.state,
      indexOptions: [],
      selectedIndexOptions: [],
      repositories: [],
      selectedRepoValue: "",
      snapshot: getEmptySnapshot(),
      snapshotId: "",
      repoError: "",
      snapshotIdError: "",
    };
  }

  async componentDidMount() {
    await this.getIndexOptions("");
    await this.getRepos();
  }

  async componentDidUpdate(prevProps: CreateSnapshotProps, prevState: CreateSnapshotState) {
    if (prevState.dataSourceId != this.state.dataSourceId) {
      this.setState({
        indexOptions: [],
        selectedIndexOptions: [],
        repositories: [],
        selectedRepoValue: "",
        snapshot: getEmptySnapshot(),
        snapshotId: "",
        repoError: "",
        snapshotIdError: "",
      });
      await this.getIndexOptions("");
      await this.getRepos();
    }
  }

  onClickAction = () => {
    const { createSnapshot } = this.props;
    const { snapshotId, selectedRepoValue, snapshot } = this.state;
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
    createSnapshot(snapshotId, selectedRepoValue, snapshot);
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    let newJSON = this.state.snapshot;
    newJSON.indices = selectedIndexOptions.toString();
    this.setState({ snapshot: newJSON, selectedIndexOptions: selectedOptions });
  };

  getIndexOptions = async (searchValue: string) => {
    const { indexService } = this.props;
    this.setState({ indexOptions: [] });
    try {
      const optionsResponse = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (optionsResponse.ok) {
        // Adding wildcard to search value
        const options = searchValue.trim() ? [{ label: wildcardOption(searchValue) }, { label: searchValue }] : [];
        // const dataStreams = optionsResponse.response.dataStreams.map((label) => ({ label }));
        const indices = optionsResponse.response.indices.map((label) => ({ label }));
        // this.setState({ indexOptions: options.concat(dataStreams, indices)});
        this.setState({ indexOptions: options.concat(indices) });
      } else {
        if (optionsResponse.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(optionsResponse.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
    }
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

  onIncludeGlobalStateToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot, "include_global_state", e.target.checked) });
  };

  onIgnoreUnavailableToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ snapshot: _.set(this.state.snapshot, "ignore_unavailable", e.target.checked) });
  };

  onPartialToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    let newJSON = this.state.snapshot;
    newJSON.partial = checked;
    this.setState({ snapshot: newJSON });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const {
      indexOptions,
      selectedIndexOptions,
      repositories,
      selectedRepoValue,
      snapshot,
      snapshotId,
      repoError,
      snapshotIdError,
    } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <EuiText size="s">
              <h2 id="flyoutTitle"> Create snapshot</h2>
            </EuiText>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="Snapshot name" />
          <EuiFormRow isInvalid={!!snapshotIdError} error={snapshotIdError}>
            <EuiFieldText
              value={snapshotId}
              onChange={(e) => {
                this.setState({ snapshotId: e.target.value });
              }}
              data-test-subj="snapshotNameInput"
              placeholder="Enter snapshot name"
            />
          </EuiFormRow>
          <EuiFormHelpText>A valid snapshot name can not contain upper case characters. </EuiFormHelpText>

          <EuiSpacer size="m" />

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

          <EuiSpacer size="l" />

          <EuiAccordion id="advanced_settings_accordian" buttonContent="Advanced options">
            <EuiSpacer size="m" />

            <SnapshotAdvancedSettings
              includeGlobalState={String(_.get(snapshot, "include_global_state", false)) == "true"}
              onIncludeGlobalStateToggle={this.onIncludeGlobalStateToggle}
              ignoreUnavailable={String(_.get(snapshot, "ignore_unavailable", false)) == "true"}
              onIgnoreUnavailableToggle={this.onIgnoreUnavailableToggle}
              partial={String(_.get(snapshot, "partial", false)) == "true"}
              onPartialToggle={this.onPartialToggle}
              width="200%"
            />
          </EuiAccordion>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter edit={false} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}

export default function (props: Omit<CreateSnapshotProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  return <CreateSnapshotFlyout {...props} {...dataSourceMenuProps} />;
}
