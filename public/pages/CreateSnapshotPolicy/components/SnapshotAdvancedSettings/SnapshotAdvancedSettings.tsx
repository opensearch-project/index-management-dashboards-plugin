/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { EuiCheckbox, EuiSpacer } from "@elastic/eui";
import React, { ChangeEvent } from "react";
import CustomLabel from "../../../../components/CustomLabel";

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
  <div style={{ padding: "10px 10px", width }}>
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
          helpText="Instead of failing snapshot, ignore any indexes that are unavailable or do not exist."
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
