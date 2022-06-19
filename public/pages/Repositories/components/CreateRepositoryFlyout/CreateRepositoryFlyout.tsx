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
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import { CreateRepositorySettings } from "../../../../../server/models/interfaces";
import React, { Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { SnapshotManagementService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import CustomLabel from "../../../../components/CustomLabel";
import { REPO_TYPES } from "./constants";

interface CreateRepositoryProps {
  service: SnapshotManagementService;
  editRepo: string | null;
  onCloseFlyout: () => void;
  createRepo: (repoName: string, type: string, settings: CreateRepositorySettings) => void;
}

interface CreateRepositoryState {
  repoName: string;
  location: string;
  repoTypeOptions: EuiComboBoxOptionOption<string>[];
  selectedRepoTypeOption: EuiComboBoxOptionOption<string>[];
  settingsJsonString: string;

  repoNameError: string;
  repoTypeError: string;
  locationError: string;
}

export default class CreateRepositoryFlyout extends Component<CreateRepositoryProps, CreateRepositoryState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateRepositoryProps) {
    super(props);

    this.state = {
      repoName: "",
      location: "",
      repoTypeOptions: [],
      selectedRepoTypeOption: [],
      settingsJsonString: JSON.stringify({}, null, 4),
      repoNameError: "",
      repoTypeError: "",
      locationError: "",
    };
  }

  async componentDidMount() {
    this.setState({ repoTypeOptions: REPO_TYPES });
    const { editRepo } = this.props;
    if (!!editRepo) {
      await this.getRepo(editRepo);
    }
  }

  getRepo = async (repoName: string) => {
    const { service } = this.props;
    try {
      const response = await service.getRepository(repoName);
      if (response.ok) {
        const repoName = Object.keys(response.response)[0];
        const repoBody = response.response[repoName];
        const type = repoBody.type;
        const settings = repoBody.settings;
        const location = settings.location;
        delete settings.location;
        const settingsJsonString = JSON.stringify(settings);
        this.setState({ repoName, location, settingsJsonString, selectedRepoTypeOption: [{ label: type }] });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the editing repository."));
    }
  };

  onSelectionChange = (selectedOption: EuiComboBoxOptionOption<string>[]) => {
    this.setState({ selectedRepoTypeOption: selectedOption });
  };

  onCreateOption = (searchValue: string, options: EuiComboBoxOptionOption<string>[]) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };
    // Create the option if it doesn't exist.
    if (options.findIndex((option) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      this.setState({ repoTypeOptions: [...this.state.repoTypeOptions, newOption] });
    }

    this.setState({ selectedRepoTypeOption: [newOption] });
  };

  onClickAction = () => {
    const { createRepo } = this.props;
    const { repoName, selectedRepoTypeOption, location, settingsJsonString } = this.state;
    try {
      const settings = JSON.parse(settingsJsonString);
      settings.location = location;
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Policy JSON");
    }
    if (!repoName.trim()) {
      this.setState({ repoNameError: "Required." });
      return;
    }
    if (selectedRepoTypeOption.length == 0) {
      this.setState({ repoTypeError: "Required." });
      return;
    }
    const repoType = selectedRepoTypeOption[0].value ?? selectedRepoTypeOption[0].label;
    if (!location.trim()) {
      this.setState({ location: "Required." });
      return;
    }
    createRepo(repoName, repoType, { location: location });
  };

  render() {
    const { editRepo, onCloseFlyout } = this.props;
    const {
      repoName,
      location,
      repoTypeOptions,
      selectedRepoTypeOption,
      settingsJsonString,
      repoNameError,
      repoTypeError,
      locationError,
    } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">{!!editRepo ? "Edit" : "Create"} repository</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="Repository name" />
          <EuiFormRow isInvalid={!!repoNameError} error={repoNameError}>
            <EuiFieldText disabled={!!editRepo} value={repoName} onChange={(e) => this.setState({ repoName: e.target.value })} />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Repository type" />
          <EuiFormRow isInvalid={!!repoTypeError} error={repoTypeError}>
            <EuiComboBox
              isDisabled={!!editRepo}
              options={repoTypeOptions}
              selectedOptions={selectedRepoTypeOption}
              onChange={this.onSelectionChange}
              onCreateOption={this.onCreateOption}
              singleSelection={true}
              isClearable={true}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Location" />
          <EuiFormRow isInvalid={!!locationError} error={locationError}>
            <EuiFieldText
              disabled={!!editRepo}
              placeholder="e.g. /mnt/snapshots"
              value={location}
              onChange={(e) => this.setState({ location: e.target.value })}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiAccordion id="repo_advanced_settings" buttonContent="Advanced settings">
            <EuiSpacer size="m" />
            <EuiCodeEditor
              mode="json"
              width="90%"
              height="250px"
              value={settingsJsonString}
              onChange={(str) => {
                this.setState({ settingsJsonString: str });
              }}
              setOptions={{ fontSize: "14px" }}
            />
          </EuiAccordion>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter save={!!editRepo} edit={!!editRepo} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
