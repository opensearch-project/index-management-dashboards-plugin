/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ChangeEvent } from "react";
import { EuiFlyout, EuiFlyoutHeader, EuiTitle } from "@elastic/eui";
import { SnapshotManagementService } from "../../../services";
import { GetSnapshot } from "../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../components/core_services";
import { getErrorMessage } from "../../../utils/helpers";

interface SnapshotFlyoutProps {
  snapshotId: string;
  snapshotManagementService: SnapshotManagementService;
  onCloseFlyout: () => void;
}

interface SnapshotFlyoutState {
  snapshot: GetSnapshot | null;
}

export default class SnapshotFlyout extends Component<SnapshotFlyoutProps, SnapshotFlyoutState> {
  static contextType = CoreServicesContext;

  constructor(props: SnapshotFlyoutProps) {
    super(props);

    this.state = {
      snapshot: null,
    };
  }

  async componentDidMount() {
    const { snapshotId } = this.props;
    await this.getSnapshot(snapshotId);
  }

  getSnapshot = async (snapshotId: string) => {
    const { snapshotManagementService } = this.props;
    try {
      const response = await snapshotManagementService.getSnapshot(snapshotId);
      if (response.ok) {
        this.setState({ snapshot: response.response });
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshot."));
    }
  };

  render() {
    const { onCloseFlyout } = this.props;
    const { snapshot } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">{snapshot?.snapshot}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
      </EuiFlyout>
    );
  }
}
