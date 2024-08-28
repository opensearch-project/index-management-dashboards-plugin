/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiLink, EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiPanel, EuiFlexGroup, EuiHorizontalRule } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { ErrorNotification, ISMTemplate } from "../../../../../models/interfaces";
import JSONModal from "../../../../components/JSONModal";

interface PolicySettingsProps {
  policyId: string;
  errorNotification: ErrorNotification | null | undefined;
  primaryTerm: number;
  lastUpdated: number | undefined;
  description: string;
  sequenceNumber: number;
  ismTemplates: ISMTemplate[] | ISMTemplate | null;
}

interface PolicySettingsState {}

export default class PolicySettings extends Component<PolicySettingsProps, PolicySettingsState> {
  render() {
    const { policyId, errorNotification, primaryTerm, lastUpdated, description, sequenceNumber } = this.props;

    const updatedDate = lastUpdated ? new Date(lastUpdated).toLocaleString() : "-";

    let errorNotificationValue: string | JSX.Element = "-";

    if (errorNotification) {
      errorNotificationValue = (
        <ModalConsumer>
          {({ onShow }) => (
            <EuiLink onClick={() => onShow(JSONModal, { title: "Error notification", json: errorNotification })}>View code</EuiLink>
          )}
        </ModalConsumer>
      );
    }

    const infoItems = [
      { term: "Policy name", value: policyId },
      { term: "Error notification", value: errorNotificationValue },
      { term: "Primary term", value: primaryTerm },
      { term: "Last updated", value: updatedDate },
      { term: "Policy description", value: description || "-" },
      { term: "Sequence number", value: sequenceNumber },
    ];

    return (
      <EuiPanel>
        <EuiFlexGroup gutterSize="xs" alignItems="center">
          <EuiText size="s">
            <h2>{`Policy settings`}</h2>
          </EuiText>
        </EuiFlexGroup>
        <EuiHorizontalRule margin={"xs"} />
        <div>
          <EuiFlexGrid columns={4}>
            {infoItems.map((item) => (
              <EuiFlexItem key={`${item.term}#${item.value}`}>
                <EuiText size="s">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </div>
      </EuiPanel>
    );
  }
}
