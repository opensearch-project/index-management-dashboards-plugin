/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiFlexGroup, EuiHorizontalRule, EuiPanel, EuiTitle } from "@elastic/eui";
import { ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";

interface GeneralInformationProps {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  targetIndexSettings: string | null;
  scheduleText: string;
  pageSize: number;
  lastUpdated: string;
  onEdit: () => void;
  useNewUX: boolean;
}

export default class GeneralInformation extends Component<GeneralInformationProps> {
  constructor(props: GeneralInformationProps) {
    super(props);
  }

  render() {
    const {
      rollupId,
      description,
      onEdit,
      sourceIndex,
      targetIndex,
      targetIndexSettings,
      scheduleText,
      pageSize,
      lastUpdated,
      useNewUX,
    } = this.props;
    const infoItems = [
      { term: "Name", value: rollupId },
      { term: "Source index", value: sourceIndex },
      { term: "Target index", value: targetIndex },
      { term: "Target index settings", value: targetIndexSettings },
      { term: "Schedule", value: scheduleText },
      { term: "Description", value: description || "-" },
      { term: "Last updated", value: lastUpdated },
      { term: "Pages per execution", value: pageSize },
    ];
    const useActions = useNewUX
      ? []
      : [
          {
            text: "Edit",
            buttonProps: {
              onClick: () => onEdit(),
            },
          },
        ];
    return (
      <EuiPanel>
        <EuiFlexGroup gutterSize="xs">
          <EuiFlexItem>
            <EuiTitle size="s">
              <h2>General information</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ModalConsumer>{() => <ContentPanelActions actions={useActions} />}</ModalConsumer>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin={"xs"} />
        <div>
          <EuiFlexGrid columns={4}>
            {infoItems
              .filter((v) => v.value != null)
              .map((item) => (
                <EuiFlexItem key={`${item.term}#${item.value}`}>
                  <EuiText size="s">
                    <dt>{item.term}</dt>
                    <dd>{item.value}</dd>
                  </EuiText>
                </EuiFlexItem>
              ))}
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </EuiPanel>
    );
  }
}
