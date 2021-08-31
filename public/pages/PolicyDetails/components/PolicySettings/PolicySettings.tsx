/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { Component } from "react";
import { EuiLink, EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { ErrorNotification, ISMTemplate } from "../../../../../models/interfaces";
import CreatePolicyModal from "../../../../components/CreatePolicyModal";
import JSONModal from "../../../../components/JSONModal";

interface PolicySettingsProps {
  policyId: string;
  errorNotification: ErrorNotification | null | undefined;
  primaryTerm: number;
  lastUpdated: number | undefined;
  description: string;
  sequenceNumber: number;
  ismTemplates: ISMTemplate[] | ISMTemplate | null;
  onEdit: (visual: boolean) => void;
}

interface PolicySettingsState {}

export default class PolicySettings extends Component<PolicySettingsProps, PolicySettingsState> {
  render() {
    const { policyId, errorNotification, primaryTerm, lastUpdated, description, sequenceNumber, onEdit } = this.props;

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
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: onEdit,
                    },
                    modal: {
                      onClickModal: (onShow: (component: any, props: object) => void) => () =>
                        onShow(CreatePolicyModal, { isEdit: true, onClickContinue: onEdit }),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "10px" }}
        title="Policy settings"
        titleSize="s"
      >
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            {infoItems.map((item) => (
              <EuiFlexItem key={`${item.term}#${item.value}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </div>
      </ContentPanel>
    );
  }
}
