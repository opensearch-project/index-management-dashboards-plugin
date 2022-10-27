/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCheckbox, EuiSpacer, EuiText } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import IndexSettingsInput from "../../components/IndexSettingsInput";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";

interface SnapshotAdvancedOptionsProps {
  getIndexSettings: (indexSettings: string) => void;
  restoreAliases: boolean;
  onRestoreAliasesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  restoreClusterState: boolean;
  onRestoreClusterStateToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreUnavailable: boolean;
  onIgnoreUnavailableToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  restorePartial: boolean;
  onRestorePartialToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  customizeIndexSettings: boolean;
  onCustomizeIndexSettingsToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreIndexSettings: boolean;
  onIgnoreIndexSettingsToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width?: string;
}

const SnapshotRestoreAdvancedOptions = ({
  getIndexSettings,
  restoreAliases,
  onRestoreAliasesToggle,
  ignoreUnavailable,
  onIgnoreUnavailableToggle,
  restoreClusterState,
  onRestoreClusterStateToggle,
  restorePartial,
  onRestorePartialToggle,
  customizeIndexSettings,
  onCustomizeIndexSettingsToggle,
  ignoreIndexSettings,
  onIgnoreIndexSettingsToggle,
  width,
}: SnapshotAdvancedOptionsProps) => {
  const {
    restore_aliases,
    include_global_state,
    ignore_unavailable,
    partial,
    customize_index_settings,
    ignore_index_settings,
  } = RESTORE_OPTIONS;

  return (
    <div style={{ padding: "10px 10px", width: width }}>
      <EuiCheckbox
        id={restore_aliases}
        label={<CustomLabel title="Restore aliases" helpText="Restore index aliases alongside their associated indices" />}
        checked={restoreAliases}
        onChange={onRestoreAliasesToggle}
      />

      <EuiSpacer size="s" />

      <EuiCheckbox
        id={include_global_state}
        label={<CustomLabel title="Restore cluster state from snapshots" />}
        checked={restoreClusterState}
        onChange={onRestoreClusterStateToggle}
      />

      <EuiSpacer size="m" />

      <EuiCheckbox
        id={ignore_unavailable}
        label={
          <CustomLabel
            title="Ignore unavailable indices"
            helpText="Instead of failing snapshot, ignore any indexes that are unavailable or do not exist."
          />
        }
        checked={ignoreUnavailable}
        onChange={onIgnoreUnavailableToggle}
      />

      <EuiSpacer size="s" />

      <EuiCheckbox
        id={partial}
        label={<CustomLabel title="Allow restore partial snapshots" />}
        checked={restorePartial}
        onChange={onRestorePartialToggle}
      />

      <EuiSpacer size="l" />

      <h5>Custom index settings</h5>
      <EuiText size="xs" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          By default, index settings are restored from indices in snapshots. You can choose to
          <br />
          customize index settings on restore.
        </p>
      </EuiText>

      <EuiSpacer size="m" />

      <EuiCheckbox
        id={customize_index_settings}
        label={<CustomLabel title="Customize index settings" helpText="Overrides index settings on all restored indices." />}
        checked={customizeIndexSettings}
        onChange={onCustomizeIndexSettingsToggle}
      />

      {customizeIndexSettings && <IndexSettingsInput getIndexSettings={getIndexSettings} ignore={false} />}

      <EuiSpacer size="s" />

      <EuiCheckbox
        id={ignore_index_settings}
        label={
          <CustomLabel title="Ignore index settings" helpText="Exclude index settings that you don't want to restore from a snapshot." />
        }
        checked={ignoreIndexSettings}
        onChange={onIgnoreIndexSettingsToggle}
      />

      {ignoreIndexSettings && <IndexSettingsInput getIndexSettings={getIndexSettings} ignore={true} />}
    </div>
  );
};

export default SnapshotRestoreAdvancedOptions;
