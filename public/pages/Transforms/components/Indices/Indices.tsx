/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiCodeEditor, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface IndicesProps {
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
  size: "s" | "m";
}

export default class Indices extends Component<IndicesProps> {
  constructor(props: IndicesProps) {
    super(props);
  }

  render() {
    const { sourceIndex, targetIndex, sourceIndexFilter, size } = this.props;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize={size}>
        <div style={{ paddingLeft: "10px" }}>
          <EuiText size="xs">
            <dt>Source index</dt>
            <dd>{sourceIndex}</dd>
          </EuiText>
          <EuiSpacer size="m" />
          <EuiText size="xs">
            <dt>Source index filter</dt>
            <EuiCodeEditor mode="json" theme="github" width="400px" height="100px" value={sourceIndexFilter} readOnly />
          </EuiText>
          <EuiSpacer size="m" />
          <EuiText size="xs">
            <dt>Target index</dt>
            <dd>{targetIndex}</dd>
          </EuiText>
        </div>
      </ContentPanel>
    );
  }
}
