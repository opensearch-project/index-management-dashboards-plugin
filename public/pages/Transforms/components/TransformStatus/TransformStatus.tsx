/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText } from "@elastic/eui";
import { TransformMetadata } from "../../../../../models/interfaces";
import { ContentPanel } from "../../../../components/ContentPanel";
import { renderStatus } from "../../utils/metadataHelper";
import { getUISettings } from "../../../../services/Services";

interface TransformStatusProps {
  metadata: TransformMetadata | undefined;
}

export default class TransformStatus extends Component<TransformStatusProps> {
  constructor(props: TransformStatusProps) {
    super(props);
  }

  render() {
    const { metadata } = this.props;
    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");
    return (
      <ContentPanel bodyStyles={{ padding: "initial" }} title="Transform status" titleSize={useUpdatedUX ? "s" : undefined}>
        <div style={{ paddingLeft: "10px" }}>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={4}>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Status</dt>
                {renderStatus(metadata)}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Documents indexed</dt>
                <dd>
                  {metadata == null || metadata.transform_metadata == null ? "-" : metadata.transform_metadata.stats.documents_indexed}
                </dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Document processed</dt>
                <dd>
                  {metadata == null || metadata.transform_metadata == null ? "-" : metadata.transform_metadata.stats.documents_processed}
                </dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Indexed time (ms)</dt>
                <dd>
                  {metadata == null || metadata.transform_metadata == null ? "-" : metadata.transform_metadata.stats.index_time_in_millis}
                </dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem />
            <EuiFlexItem />
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Page processed</dt>
                <dd>{metadata == null || metadata.transform_metadata == null ? "-" : metadata.transform_metadata.stats.pages_processed}</dd>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="xs">
                <dt>Search time (ms)</dt>
                <dd>
                  {metadata == null || metadata.transform_metadata == null ? "-" : metadata.transform_metadata.stats.search_time_in_millis}
                </dd>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
        </div>
      </ContentPanel>
    );
  }
}
