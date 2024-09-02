/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedRadio, EuiSpacer } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";
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
}: SnapshotRenameOptionsProps) => {
  const { do_not_rename, add_prefix, rename_indices } = RESTORE_OPTIONS;

  return (
    <div>
      <CustomLabel title={"Rename restored indices"} />
      <EuiCompressedRadio
        id={do_not_rename}
        name="rename_option"
        label="Do not rename"
        checked={doNotRename}
        onChange={onDoNotRenameToggle}
      />

      <EuiSpacer size="s" />

      <EuiCompressedRadio
        id={add_prefix}
        name="rename_option"
        label="Add prefix to restored index names"
        checked={addPrefix}
        onChange={onAddPrefixToggle}
      />

      <EuiSpacer size="s" />

      <EuiCompressedRadio
        id={rename_indices}
        name="rename_option"
        label="Rename using regular expression (Advanced)"
        checked={renameIndices}
        onChange={onRenameIndicesToggle}
      />
    </div>
  );
};

export default SnapshotRenameOptions;
