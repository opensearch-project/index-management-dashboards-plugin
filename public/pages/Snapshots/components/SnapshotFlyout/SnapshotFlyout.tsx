/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiButtonEmpty,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { SnapshotManagementService } from "../../../../services";
import { GetSnapshot } from "../../../../../server/models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import * as H from "history";
import { ROUTES } from "../../../../utils/constants";
import InfoModal from "../../../SnapshotPolicyDetails/components/InfoModal";
import { ModalConsumer } from "../../../../components/Modal";

interface SnapshotFlyoutProps {
  snapshotId: string;
  repository: string;
  snapshotManagementService: SnapshotManagementService;
  onCloseFlyout: () => void;
  history: H.History;
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
    const { snapshotId, repository } = this.props;
    await this.getSnapshot(snapshotId, repository);
  }

  getSnapshot = async (snapshotId: string, repository: string) => {
    const { snapshotManagementService } = this.props;
    try {
      const response = await snapshotManagementService.getSnapshot(snapshotId, repository);
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

    const items1 = [
      { term: "Snapshot name", value: snapshot?.snapshot },
      { term: "Status", value: snapshot?.state },
    ];

    const items2 = [
      { term: "Start time", value: snapshot?.start_time },
      { term: "End time", value: snapshot?.end_time },
      { term: "Repository", value: snapshot?.snapshot },
      {
        term: "Policy",
        value: (
          <EuiLink onClick={() => this.props.history.push(`${ROUTES.SNAPSHOT_POLICY_DETAILS}?id=${snapshot?.metadata?.sm_policy}`)}>
            {snapshot?.metadata?.sm_policy}
          </EuiLink>
        ),
      },
    ];

    let error;
    if (snapshot?.failures != null) {
      error = (
        <EuiText size="xs">
          <dt>Error details</dt>
          <dd>
            <ModalConsumer>
              {({ onShow }) => <EuiLink onClick={() => onShow(InfoModal, { info: snapshot.failures })}>failures</EuiLink>}
            </ModalConsumer>
          </dd>
        </EuiText>
      );
    }

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">{snapshot?.snapshot}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <EuiFlexGrid columns={2}>
            {items1.map((item) => (
              <EuiFlexItem key={`${item.term}#${item.value}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>

          <EuiSpacer size="m" />
          {error}
          <EuiSpacer size="m" />

          <EuiFlexGrid columns={2}>
            {items2.map((item) => (
              <EuiFlexItem key={`${item.term}#${item.value}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>

          <EuiSpacer size="l" />

          <EuiText size="xs">
            <dt>Indices</dt>
            <dd>{snapshot?.indices.join(", ")}</dd>
          </EuiText>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <EuiButtonEmpty onClick={onCloseFlyout}>Close</EuiButtonEmpty>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
