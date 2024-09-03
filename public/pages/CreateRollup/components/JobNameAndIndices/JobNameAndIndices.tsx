/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiFlexGroup, EuiHorizontalRule, EuiPanel } from "@elastic/eui";
import { ContentPanel, ContentPanelActions } from "../../../../components/ContentPanel";
import { ModalConsumer } from "../../../../components/Modal";
import { IndexItem } from "../../../../../models/interfaces";

interface JobNameAndIndicesProps {
  rollupId: string;
  description: string;
  sourceIndex: { label: string; value?: IndexItem }[];
  targetIndex: { label: string; value?: IndexItem }[];
  onChangeStep: (step: number) => void;
}

export default class JobNameAndIndices extends Component<JobNameAndIndicesProps> {
  constructor(props: JobNameAndIndicesProps) {
    super(props);
  }

  render() {
    const { rollupId, description, onChangeStep, sourceIndex, targetIndex } = this.props;

    return (
      <EuiPanel>
        <EuiFlexGroup gutterSize="xs">
          <EuiFlexItem>
            <EuiText size="s">
              <h2>Job name and indexes</h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ModalConsumer>
              {() => (
                <ContentPanelActions
                  actions={[
                    {
                      text: "Edit",
                      buttonProps: {
                        onClick: () => onChangeStep(1),
                      },
                    },
                  ]}
                />
              )}
            </ModalConsumer>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin={"xs"} />
        <div>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Name</dt>
                <dd>{rollupId}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Source Index</dt>
                <dd>{sourceIndex[0].label}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Target index</dt>
                <dd>{targetIndex[0].label}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <dt>Description</dt>
                <dd>{description == "" ? "-" : description}</dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </EuiPanel>
    );
  }
}
