/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedCheckbox, EuiSpacer, EuiText } from "@elastic/eui";
import { CheckBoxLabel } from "../../helper";
import IndexSettingsInput from "../../components/IndexSettingsInput";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";

interface SnapshotAdvancedOptionsProps {
  getIndexSettings: (indexSettings: string, ignore: boolean) => void;
  restoreAliases: boolean;
  onRestoreAliasesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  restoreClusterState: boolean;
  onRestoreClusterStateToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreUnavailable: boolean;
  onIgnoreUnavailableToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  customizeIndexSettings: boolean;
  onCustomizeIndexSettingsToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  ignoreIndexSettings: boolean;
  onIgnoreIndexSettingsToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width?: string;
  badJSONInput: boolean;
  badIgnoreInput: boolean;
}

const SnapshotRestoreAdvancedOptions = ({
  getIndexSettings,
  restoreAliases,
  onRestoreAliasesToggle,
  ignoreUnavailable,
  onIgnoreUnavailableToggle,
  restoreClusterState,
  onRestoreClusterStateToggle,
  customizeIndexSettings,
  onCustomizeIndexSettingsToggle,
  ignoreIndexSettings,
  onIgnoreIndexSettingsToggle,
  width,
  badJSONInput,
  badIgnoreInput,
}: SnapshotAdvancedOptionsProps) => {
  const { restore_aliases, include_global_state, ignore_unavailable, customize_index_settings, ignore_index_settings } = RESTORE_OPTIONS;
  const JSONerror = "Please enter valid JSON between curly brackets.";
  const ignoreListError = "Please enter a comma separated list of valid settings to ignore.";

  return (
    <div style={{ padding: "10px 10px", width: width }}>
      <EuiCompressedCheckbox
        id={restore_aliases}
        label={<CheckBoxLabel title="Restore aliases" helpText="Restore index aliases alongside their associated indices." />}
        checked={restoreAliases}
        onChange={onRestoreAliasesToggle}
      />

      <EuiSpacer size="s" />

      <EuiCompressedCheckbox
        id={include_global_state}
        label={<EuiText size="s">Restore cluster state from snapshots</EuiText>}
        checked={restoreClusterState}
        onChange={onRestoreClusterStateToggle}
      />

      <EuiSpacer size="m" />

      <EuiCompressedCheckbox
        id={ignore_unavailable}
        label={
          <CheckBoxLabel
            title="Ignore unavailable indices"
            helpText="Instead of failing restore operation, ignore any indices that are unavailable or do not exist."
          />
        }
        checked={ignoreUnavailable}
        onChange={onIgnoreUnavailableToggle}
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

      <EuiCompressedCheckbox
        id={customize_index_settings}
        label={<CheckBoxLabel title="Customize index settings" helpText="Overrides index settings on all restored indices." />}
        checked={customizeIndexSettings}
        onChange={onCustomizeIndexSettingsToggle}
      />

      {customizeIndexSettings && (
        <IndexSettingsInput getIndexSettings={getIndexSettings} ignore={false} showError={badJSONInput} inputError={JSONerror} />
      )}

      <EuiSpacer size="s" />

      <EuiCompressedCheckbox
        id={ignore_index_settings}
        label={
          <CheckBoxLabel title="Ignore index settings" helpText="Exclude index settings that you don't want to restore from a snapshot." />
        }
        checked={ignoreIndexSettings}
        onChange={onIgnoreIndexSettingsToggle}
      />

      {ignoreIndexSettings && (
        <IndexSettingsInput getIndexSettings={getIndexSettings} ignore={true} showError={badIgnoreInput} inputError={ignoreListError} />
      )}
    </div>
  );
};

export default SnapshotRestoreAdvancedOptions;
