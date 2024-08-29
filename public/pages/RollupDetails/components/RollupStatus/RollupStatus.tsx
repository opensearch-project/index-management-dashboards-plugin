/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFlexGrid, EuiSpacer, EuiFlexItem, EuiText, EuiFlexGroup, EuiHorizontalRule, EuiPanel } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import { RollupMetadata } from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";
import { renderStatus } from "../../utils/helpers";

interface RollupStatusProps {
  metadata: RollupMetadata | undefined;
}

const RollupStatus = ({ metadata }: RollupStatusProps) => (
  <EuiPanel>
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem>
        <EuiText size="s">
          <h2>Rollup status</h2>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiHorizontalRule margin={"xs"} />
    <div>
      <EuiFlexGrid columns={4}>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Current rollup window</dt>
            <dd>
              {metadata == null || metadata.rollup_metadata == null || metadata.rollup_metadata.continuous == null
                ? "-"
                : renderTime(metadata.rollup_metadata.continuous.next_window_start_time) +
                  " - " +
                  renderTime(metadata.rollup_metadata.continuous.next_window_end_time)}
            </dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Status</dt>
            {renderStatus(metadata)}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Rollup indexed</dt>
            <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.rollups_indexed}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Indexed time (ms)</dt>
            <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.index_time_in_millis}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Document processed</dt>
            <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.documents_processed}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Search time (ms)</dt>
            <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.search_time_in_millis}</dd>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s">
            <dt>Page processed</dt>
            <dd>{metadata == null || metadata.rollup_metadata == null ? "-" : metadata.rollup_metadata.stats.pages_processed}</dd>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGrid>
      <EuiSpacer size="s" />
    </div>
  </EuiPanel>
);
export default RollupStatus;
