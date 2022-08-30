/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiRadio, EuiSpacer, EuiText } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import React, { ChangeEvent } from "react";

interface SnapshotInitialOptionsProps {
  restoreAllIndices: boolean;
  onRestoreAllIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  restoreSpecificIndices: boolean;
  onRestoreSpecificIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  doNotRename: boolean;
  onDoNotRenameToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  addPrefix: boolean;
  onAddPrefixToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  renameIndices: boolean;
  onRenameIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width: string;
}

const SnapshotRestoreInitialOptions = ({
  restoreAllIndices,
  onRestoreAllIndicesToggle,
  restoreSpecificIndices,
  onRestoreSpecificIndicesToggle,
  doNotRename,
  onDoNotRenameToggle,
  addPrefix,
  onAddPrefixToggle,
  renameIndices,
  onRenameIndicesToggle,
  width,
}: SnapshotInitialOptionsProps) => (
  <div style={{ width: width }}>
    <h5>Specify restore option</h5>

    <EuiSpacer size="m" />

    <EuiRadio
      id="restore_all_indices"
      name="restore_option"
      label={<CustomLabel title="Restore all indices in snapshot" />}
      checked={true}
      onChange={onRestoreAllIndicesToggle}
    />

    <EuiSpacer size="s" />

    <EuiRadio
      id="restore_specific_indices"
      name="restore_option"
      label={<CustomLabel title="Restore specific indices" />}
      checked={restoreSpecificIndices}
      onChange={onRestoreSpecificIndicesToggle}
    />

    <EuiSpacer size="xxl" />

    <h5>Rename restored indices</h5>

    <EuiSpacer size="m" />

    <EuiRadio
      id="do_not_rename"
      name="rename_option"
      label={<CustomLabel title="Do not rename" />}
      checked={true}
      onChange={onDoNotRenameToggle}
    />

    <EuiSpacer size="s" />

    <EuiRadio
      id="add_prefix"
      name="rename_option"
      label={<CustomLabel title="Add prefix to restored index names" />}
      checked={addPrefix}
      onChange={onAddPrefixToggle}
    />

    <EuiSpacer size="s" />

    <EuiRadio
      id="rename_indices"
      name="rename_option"
      label={<CustomLabel title="Rename using regular expression (Advanced)" />}
      checked={renameIndices}
      onChange={onRenameIndicesToggle}
    />
  </div>
);

export default SnapshotRestoreInitialOptions;
