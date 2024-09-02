/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiFlexGroup, EuiPanel, EuiHorizontalRule } from "@elastic/eui";
import { ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { getUISettings } from "../../../../services/Services";

interface GeneralInformationProps {
  id: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
  scheduledText: string;
  pageSize: number;
  enabledAt: number;
  updatedAt: number;
  onEdit: () => void;
}

export default class GeneralInformation extends Component<GeneralInformationProps> {
  constructor(props: GeneralInformationProps) {
    super(props);
  }

  render() {
    const { id, description, sourceIndex, targetIndex, sourceIndexFilter, scheduledText, pageSize, updatedAt, onEdit } = this.props;

    const enableDate = new Date(updatedAt);

    const infoItems = [
      { term: "Name", value: id },
      { term: "State", value: "Enabled on " + enableDate.toLocaleString() }, // show disabled state, make a const
      { term: "Source index", value: sourceIndex },
      { term: "Schedule", value: scheduledText },
      { term: "Description", value: description || "-" },
      {},
      { term: "Source index filter", value: sourceIndexFilter },
      { term: "Pages per execution", value: pageSize },
      {},
      {},
      { term: "Target index", value: targetIndex },
    ];
    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");
    const size = useUpdatedUX ? "s" : undefined;

    return (
      <>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText size="s">
                <h2>General information</h2>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {!useUpdatedUX ? (
                <ModalConsumer>
                  {() => (
                    <ContentPanelActions
                      size={size}
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
              ) : null}
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiHorizontalRule margin="xs" />
          <div>
            <EuiSpacer size="s" />
            <EuiFlexGrid columns={4}>
              {infoItems.map((item, index) => (
                <EuiFlexItem key={index}>
                  <EuiText size="xs">
                    <dt>{item.term}</dt>
                    <dd>{item.value}</dd>
                  </EuiText>
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
            <EuiSpacer size="s" />
          </div>
        </EuiPanel>
      </>
    );
  }
}
