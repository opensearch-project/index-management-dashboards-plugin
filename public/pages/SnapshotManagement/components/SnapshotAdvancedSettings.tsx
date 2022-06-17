/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiHorizontalRule, EuiSpacer, EuiSwitchEvent } from "@elastic/eui";
import ToggleWrapper from "./ToggleWrapper";
import CustomLabel from "./CustomLabel";
import React from "react";

interface SnapshotAdvancedSettingsProps {
  includeGlobalState: boolean;
  onIncludeGlobalStateToggle: (event: EuiSwitchEvent) => void;
  ignoreUnavailable: boolean;
  onIgnoreUnavailableToggle: (event: EuiSwitchEvent) => void;
  partial: boolean;
  onPartialToggle: (event: EuiSwitchEvent) => void;
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
    <ToggleWrapper
      label={<CustomLabel title="Include cluster state in snapshots" />}
      checked={includeGlobalState}
      onSwitchChange={onIncludeGlobalStateToggle}
    />

    <EuiSpacer size="m" />

    <ToggleWrapper
      label={
        <CustomLabel
          title="Ignore unavailable indices"
          helpText="Instead of failing snapshot, ignore any indices that are unavailable or do not exist."
        />
      }
      checked={ignoreUnavailable}
      onSwitchChange={onIgnoreUnavailableToggle}
    />

    <EuiSpacer size="m" />

    <ToggleWrapper
      label={
        <CustomLabel title="Allow partial snapshots" helpText="Allow taking partial snapshots if one or more shards failed to store." />
      }
      checked={partial}
      onSwitchChange={onPartialToggle}
    />
  </div>
);

export default SnapshotAdvancedSettings;
