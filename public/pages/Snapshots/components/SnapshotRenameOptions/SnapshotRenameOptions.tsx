/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiRadio, EuiSpacer } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import React, { ChangeEvent } from "react";

interface SnapshotRenameOptionsProps {
  doNotRename: boolean;
  onDoNotRenameToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  addPrefix: boolean;
  onAddPrefixToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  renameIndices: boolean;
  onRenameIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width: string;
}

const SnapshotRenameOptions = ({
  doNotRename,
  onDoNotRenameToggle,
  addPrefix,
  onAddPrefixToggle,
  renameIndices,
  onRenameIndicesToggle,
  width,
}: SnapshotRenameOptionsProps) => (
  <div style={{ width: width }}>
    <h5>Rename restored indices</h5>

    <EuiSpacer size="m" />

    <EuiRadio
      id="do_not_rename"
      name="rename_option"
      label={<CustomLabel title="Do not rename" />}
      checked={doNotRename}
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

export default SnapshotRenameOptions;
