/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiCodeEditor,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSelectOption,
  EuiSpacer,
  EuiSwitchEvent,
  EuiTextArea,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";

import React, { Component } from "react";
import FlyoutFooter from "../../VisualCreatePolicy/components/FlyoutFooter";
import CustomLabel from "./CustomLabel";
import { CoreServicesContext } from "../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../services";
import { getErrorMessage, wildcardOption } from "../../../utils/helpers";
import { IndexItem, Snapshot } from "../../../../models/interfaces";
import SnapshotIndicesRepoInput from "./SnapshotIndicesRepoInput";
import ToggleWrapper from "./ToggleWrapper";
import { getEmptySnapshot } from "../utils/constants";
import { CatRepository } from "../../../../server/models/interfaces";

interface CreateSnapshotProps {
  snapshotManagementService: SnapshotManagementService;
  indexService: IndexService;
  onCloseFlyout: () => void;
  createSnapshot: (snapshotId: string, repository: string, snapshot: Snapshot) => void;
}

interface CreateSnapshotState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];

  repositories: CatRepository[];
  selectedRepoValue: string;

  snapshot: Snapshot;
  snapshotId: string;
}

export default class CreateSnapshotFlyout extends Component<CreateSnapshotProps, CreateSnapshotState> {
  static contextType = CoreServicesContext;
  constructor(props: CreateSnapshotProps) {
    super(props);

    this.state = {
      indexOptions: [],
      selectedIndexOptions: [],
      repositories: [],
      selectedRepoValue: "",
      snapshot: getEmptySnapshot(),
      snapshotId: "",
    };
  }

  async componentDidMount() {
    await this.getIndexOptions("");
    await this.getRepos();
  }

  onClickAction = () => {
    const { createSnapshot } = this.props;
    const { snapshotId, selectedRepoValue, snapshot } = this.state;
    console.log(`sm dev snapshot body ${JSON.stringify(snapshot)}`);
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
        this.setState({ repositories: response.response });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    }
  };

  onRepoSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepo = e.target.value;
    this.setState({ selectedRepoValue: selectedRepo });
  };

  onIncludeGlobalStateToggle = (event: EuiSwitchEvent) => {
    this.setState({ snapshot: _.set(this.state.snapshot, "include_global_state", event.target.checked) });
  };

  onIgnoreUnavailableToggle = (event: EuiSwitchEvent) => {
    this.setState({ snapshot: _.set(this.state.snapshot, "ignore_unavailable", event.target.checked) });
  };

  onPartialToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.snapshot;
    newJSON.partial = checked;
    this.setState({ snapshot: newJSON });
  };

  render() {
    const { onCloseFlyout } = this.props;
    const { indexOptions, selectedIndexOptions, repositories, selectedRepoValue, snapshot, snapshotId } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Create snapshot</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="Snapshot name" />
          <EuiFieldText
            value={snapshotId}
            onChange={(e) => {
              this.setState({ snapshotId: e.target.value });
            }}
          />

          <SnapshotIndicesRepoInput
            indexOptions={indexOptions}
            selectedIndexOptions={selectedIndexOptions}
            onIndicesSelectionChange={this.onIndicesSelectionChange}
            getIndexOptions={this.getIndexOptions}
            onCreateOption={this.onCreateOption}
            repoOptions={repoOptions}
            selectedRepoValue={selectedRepoValue}
            onRepoSelectionChange={this.onRepoSelectionChange}
          />

          <EuiSpacer size="m" />

          <EuiAccordion id="advanced_settings_accordian" buttonContent="Advanced options">
            <ToggleWrapper
              label={
                <CustomLabel title="Include global state" helpText="Whether to include cluster state in the snapshot." isOptional={true} />
              }
              checked={String(_.get(snapshot, "include_global_state", false)) == "true"}
              onSwitchChange={this.onIncludeGlobalStateToggle}
            />

            <EuiSpacer size="m" />

            <ToggleWrapper
              label={
                <CustomLabel
                  title="Ignore unavailable"
                  helpText="Whether to ignore unavailable index rather than fail the snapshot."
                  isOptional={true}
                />
              }
              checked={String(_.get(snapshot, "ignore_unavailable", false)) == "true"}
              onSwitchChange={this.onIgnoreUnavailableToggle}
            />

            <EuiSpacer size="m" />

            <ToggleWrapper
              label={
                <CustomLabel
                  title="Partial"
                  helpText="Whether to allow partial snapshots rather than fail the snapshot."
                  isOptional={true}
                />
              }
              checked={String(_.get(snapshot, "partial", false)) == "true"}
              onSwitchChange={this.onPartialToggle}
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
