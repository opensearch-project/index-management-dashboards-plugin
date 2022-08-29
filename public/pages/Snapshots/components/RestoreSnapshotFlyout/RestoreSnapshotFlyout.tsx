/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption, EuiFlyout, EuiFlyoutBody, EuiFlyoutFooter, EuiFlyoutHeader, EuiSpacer, EuiTitle } from "@elastic/eui";
import _ from "lodash";
import React, { Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexService, SnapshotManagementService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import { CatRepository, GetSnapshot } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import SnapshotAdvancedSettings from "../../../CreateSnapshotPolicy/components/SnapshotAdvancedSettings";
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
    console.log("clicked");
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
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    let newJSON = this.state.snapshot;
    // newJSON.indices = selectedIndexOptions.toString();
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

  render() {
    const { onCloseFlyout, snapshotId } = this.props;
    const { indexOptions, selectedIndexOptions, repositories, selectedRepoValue, repoError } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={1000} size="l" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">Restore snapshot</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <CustomLabel title="Snapshot name" />
          <h3>{snapshotId}</h3>

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
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter edit={false} action="" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
