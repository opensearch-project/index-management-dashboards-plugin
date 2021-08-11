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
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiBasicTable } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { ISMTemplate } from "../../../../../models/interfaces";

interface PolicySettingsProps {
  policyId: string;
  channelId: string;
  primaryTerm: number;
  lastUpdated: string;
  description: string;
  sequenceNumber: number;
  schemaVersion: number;
  ismTemplates: ISMTemplate[];
}

interface PolicySettingsState {
  pageIndex: number;
  pageSize: number;
  showPerPageOptions: boolean;
}

export default class PolicySettings extends Component<PolicySettingsProps, PolicySettingsState> {
  constructor(props: PolicySettingsProps) {
    super(props);

    this.state = {
      pageIndex: 0,
      pageSize: 10,
      showPerPageOptions: true,
    }
  }

  onTableChange = ({ page = {} }) => {
    const { index: pageIndex, size: pageSize } = page;

    this.setState({pageIndex, pageSize});
  };

  render() {
    const {
      policyId,
      channelId,
      primaryTerm,
      lastUpdated,
      description,
      sequenceNumber,
      schemaVersion,
      ismTemplates,
    } = this.props;

    const {
      pageIndex,
      pageSize,
      showPerPageOptions,
    } = this.state;

    const updatedDate = new Date(lastUpdated);

    const columns = [
      {
        field: 'index_patterns',
        name: 'Index patterns',
        truncateText: false
      },
      {
        field: 'priority',
        name: "Priority",
        truncateText: false
      }
    ]

    const infoItems = [
      { term: "Policy name", value: policyId },
      { term: "channel ID", value: channelId || "-" },
      { term: "Primary term", value: primaryTerm },
      { term: "Last updated", value: updatedDate.toLocaleString() },
      { term: "Policy description", value: description || "-" },
      { term: "Sequence number", value: sequenceNumber },
      { term: "Schema version", value: schemaVersion },
    ];

    const pagination = {
      pageIndex: pageIndex,
      pageSize,
      totalItemCount: ismTemplates.length,
      pageSizeOptions: [10, 20, 50],
      hidePerPageOptions: !showPerPageOptions,
    };

    return(
      <ContentPanel
        actions={
          <ModalConsumer>
            {() => (
              <ContentPanelActions
                actions={[
                  {
                    text: "Edit",
                    buttonProps: {
                      onClick: () => {},
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        panelStyles={{ padding: "20px 20px" }}
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
          <EuiSpacer size="s" />
          <ContentPanel
            panelStyles={{ padding: "20px 20px" }}
            bodyStyles={{ padding: "10px" }}
            title="ISM Templates"
            titleSize="s"
          >
            <EuiBasicTable
              items={ismTemplates}
              columns={columns}
              pagination={pagination}
              onChange={this.onTableChange}
            />
          </ContentPanel>
        </div>
      </ContentPanel>
    );
  }
}
