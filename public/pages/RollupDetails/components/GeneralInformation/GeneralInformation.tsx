/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface GeneralInformationProps {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  scheduleText: string;
  pageSize: number;
  lastUpdated: string;
  onEdit: () => void;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class GeneralInformation extends Component<GeneralInformationProps> {
  constructor(props: GeneralInformationProps) {
    super(props);
  }

  render() {
    const { rollupId, description, onEdit, sourceIndex, targetIndex, scheduleText, pageSize, lastUpdated } = this.props;
    const infoItems = [
      { term: "Name", value: rollupId },
      { term: "Source index", value: sourceIndex },
      { term: "Target index", value: targetIndex },
      { term: "Schedule", value: scheduleText },
      { term: "Description", value: description || "-" },
      { term: "Last updated", value: lastUpdated },
      { term: "Pages per execution", value: pageSize },
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
                      onClick: () => onEdit(),
                    },
                  },
                ]}
              />
            )}
          </ModalConsumer>
        }
        bodyStyles={{ padding: "initial" }}
        title="General information"
        titleSize="m"
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
        </div>
      </ContentPanel>
    );
  }
}
