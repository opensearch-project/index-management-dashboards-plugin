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
import { EuiCodeEditor, EuiSpacer, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface IndicesProps {
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
}

export default class Indices extends Component<IndicesProps> {
  constructor(props: IndicesProps) {
    super(props);
  }

  render() {
    const { sourceIndex, targetIndex, sourceIndexFilter } = this.props;

    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Indices" titleSize="m">
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
