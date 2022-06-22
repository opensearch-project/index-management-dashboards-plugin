/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCheckbox, EuiSpacer } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import React, { ChangeEvent } from "react";

interface SnapshotAdvancedSettingsProps {
  includeGlobalState: boolean;
  onIncludeGlobalStateToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreUnavailable: boolean;
  onIgnoreUnavailableToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  partial: boolean;
  onPartialToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width?: string;
}

const SnapshotAdvancedSettings = ({
  includeGlobalState,
  onIncludeGlobalStateToggle,
  ignoreUnavailable,
  onIgnoreUnavailableToggle,
  partial,
  onPartialToggle,
  width,
}: SnapshotAdvancedSettingsProps) => (
  <div style={{ padding: "10px 10px", width: width }}>
    <EuiCheckbox
      id="include_global_state"
      label={<CustomLabel title="Include cluster state in snapshots" />}
      checked={includeGlobalState}
      onChange={onIncludeGlobalStateToggle}
    />

    <EuiSpacer size="m" />

    <EuiCheckbox
      id="ignore_unavailable"
      label={
        <CustomLabel
          title="Ignore unavailable indices"
          helpText="Instead of failing snapshot, ignore any indices that are unavailable or do not exist."
        />
      }
      checked={ignoreUnavailable}
      onChange={onIgnoreUnavailableToggle}
    />

    <EuiSpacer size="m" />

    <EuiCheckbox
      id="partial"
      label={<CustomLabel title="Allow partial snapshots" helpText="Allow partial snapshots if one or more shards failed to store." />}
      checked={partial}
      onChange={onPartialToggle}
    />
  </div>
);

export default SnapshotAdvancedSettings;
