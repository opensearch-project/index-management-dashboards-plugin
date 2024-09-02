/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedCheckbox, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import React, { ChangeEvent } from "react";
import { CheckBoxLabel } from "../../../Snapshots/helper";

interface SnapshotAdvancedSettingsProps {
  includeGlobalState: boolean;
  onIncludeGlobalStateToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreUnavailable: boolean;
  onIgnoreUnavailableToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  partial: boolean;
  onPartialToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width?: string;
}

const lableTitle = (titleText: string) => {
  return (
    <EuiFlexGroup gutterSize="xs" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <h4>{titleText}</h4>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const SnapshotAdvancedSettings = ({
  includeGlobalState,
  onIncludeGlobalStateToggle,
  ignoreUnavailable,
  onIgnoreUnavailableToggle,
  partial,
  onPartialToggle,
  width,
}: SnapshotAdvancedSettingsProps) => (
  <div>
    <EuiCompressedCheckbox
      id="include_global_state"
      label={<CheckBoxLabel title="Include cluster state in snapshots" />}
      checked={includeGlobalState}
      onChange={onIncludeGlobalStateToggle}
    />

    <EuiSpacer size="m" />

    <EuiCompressedCheckbox
      id="ignore_unavailable"
      label={
        <CheckBoxLabel
          title="Ignore unavailable indices"
          helpText="Instead of failing snapshot, ignore any indexes that are unavailable or do not exist."
        />
      }
      checked={ignoreUnavailable}
      onChange={onIgnoreUnavailableToggle}
    />

    <EuiSpacer size="m" />

    <EuiCompressedCheckbox
      id="partial"
      label={<CheckBoxLabel title="Allow partial snapshots" helpText="Allow partial snapshots if one or more shards failed to store." />}
      checked={partial}
      onChange={onPartialToggle}
    />
  </div>
);

export default SnapshotAdvancedSettings;
