/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiCallOut,
  EuiCodeEditor,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSelect,
  EuiSpacer,
  EuiText,
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
import { CUSTOM_CONFIGURATION, FS_ADVANCED_SETTINGS, REPO_SELECT_OPTIONS, REPO_TYPES } from "./constants";
import {
  FS_REPOSITORY_DOCUMENTATION_URL,
  REPOSITORY_DOCUMENTATION_URL,
  S3_REPOSITORY_DOCUMENTATION_URL,
  SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL,
} from "../../../../utils/constants";

interface CreateRepositoryProps {
  service: SnapshotManagementService;
  editRepo: string | null;
  onCloseFlyout: () => void;
  createRepo: (repoName: string, repoType: string, settings: CreateRepositorySettings) => void;
}

interface CreateRepositoryState {
  repoName: string;
  location: string;
  // repoTypeOptions: EuiComboBoxOptionOption<string>[];
  // selectedRepoTypeOption: EuiComboBoxOptionOption<string>[];

  selectedRepoTypeOption: string;
  fsSettingsJsonString: string;
  customSettingsJsonString: string;

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
      // repoTypeOptions: [],
      selectedRepoTypeOption: REPO_SELECT_OPTIONS[0].value as string,
      fsSettingsJsonString: JSON.stringify(FS_ADVANCED_SETTINGS, null, 4),
      customSettingsJsonString: JSON.stringify(CUSTOM_CONFIGURATION, null, 4),
      repoNameError: "",
      repoTypeError: "",
      locationError: "",
    };
  }

  async componentDidMount() {
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
        this.setState({ repoName, location });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the editing repository."));
    }
  };

  onClickAction = () => {
    const { createRepo } = this.props;
    const { repoName, selectedRepoTypeOption, location, fsSettingsJsonString, customSettingsJsonString } = this.state;

    if (!repoName.trim()) {
      this.setState({ repoNameError: "Required." });
      return;
    }
    if (!location.trim()) {
      this.setState({ location: "Required." });
      return;
    }
    if (selectedRepoTypeOption == "fs") {
      let settings;
      try {
        settings = JSON.parse(fsSettingsJsonString);
        settings.location = location;
      } catch (err) {
        this.context.notifications.toasts.addDanger("Invalid Policy JSON");
      }
      createRepo(repoName, selectedRepoTypeOption, settings);
    } else if (selectedRepoTypeOption == "custom") {
      let repoType;
      let settings;
      try {
        const parsed = JSON.parse(customSettingsJsonString);
        repoType = parsed.type;
        settings = parsed.settings;
        createRepo(repoName, repoType, settings);
      } catch (err) {
        this.context.notifications.toasts.addDanger("Invalid Policy JSON");
      }
    }
  };

  render() {
    const { editRepo, onCloseFlyout } = this.props;
    const {
      repoName,
      location,
      selectedRepoTypeOption,
      fsSettingsJsonString,
      customSettingsJsonString,
      repoNameError,
      repoTypeError,
      locationError,
    } = this.state;

    const customConfigHelpText = (
      <EuiText color="subdued" size="xs" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Define a repository by custom type and settings.{" "}
          <EuiLink href={S3_REPOSITORY_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            View sample configurations
          </EuiLink>
        </p>
      </EuiText>
    );
    let configuration;
    if (selectedRepoTypeOption == "fs") {
      configuration = (
        <>
          <CustomLabel title="Location" />
          <EuiFormRow isInvalid={!!locationError} error={locationError}>
            <EuiFieldText
              disabled={!!editRepo}
              placeholder="e.g., /mnt/snapshots"
              value={location}
              onChange={(e) => this.setState({ location: e.target.value })}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiAccordion id="repo_advanced_settings" buttonContent="Advanced settings">
            <EuiSpacer size="s" />

            <EuiText color="subdued" size="xs" style={{ padding: "5px 0px" }}>
              <p style={{ fontWeight: 200 }}>
                Define additional settings for this repository.{" "}
                <EuiLink href={FS_REPOSITORY_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                  Learn more
                </EuiLink>
              </p>
            </EuiText>
            <EuiCodeEditor
              mode="json"
              width="90%"
              height="250px"
              value={fsSettingsJsonString}
              onChange={(str) => {
                this.setState({ fsSettingsJsonString: str });
              }}
              setOptions={{ fontSize: "14px" }}
            />
          </EuiAccordion>
        </>
      );
    }
    if (selectedRepoTypeOption == "custom") {
      configuration = (
        <>
          <EuiCallOut title="Install and configure custom repository types">
            <p>
              To use a custom repository, such as Amazon S3, Azure Blob Storage or similar, install and configure the respective repository
              plugin on OpenSearch and then define the repository configuration below.{" "}
              <EuiLink href={REPOSITORY_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                Learn more
              </EuiLink>
            </p>
          </EuiCallOut>

          <EuiSpacer size="s" />

          <CustomLabel title="Custom configuration" helpText={customConfigHelpText} />

          <EuiCodeEditor
            mode="json"
            width="90%"
            height="250px"
            value={customSettingsJsonString}
            onChange={(str) => {
              this.setState({ customSettingsJsonString: str });
            }}
            setOptions={{ fontSize: "14px" }}
          />
        </>
      );
    }

    const repoTypeHelpText = (
      <EuiText color="subdued" size="xs" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Select a supported repository type. For additional types, install the latest repository plugins and choose Custom configuration.{" "}
          <EuiLink href={REPOSITORY_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

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
            <EuiFieldText
              disabled={!!editRepo}
              value={repoName}
              data-test-subj="repoNameInput"
              onChange={(e) => this.setState({ repoName: e.target.value })}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Repository type" helpText={repoTypeHelpText} />
          <EuiFormRow isInvalid={!!repoTypeError} error={repoTypeError}>
            <EuiSelect
              options={REPO_SELECT_OPTIONS}
              value={selectedRepoTypeOption}
              onChange={(e) => this.setState({ selectedRepoTypeOption: e.target.value })}
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          {configuration}

          <EuiSpacer size="m" />
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter save={!!editRepo} edit={!!editRepo} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
