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

import React, { ChangeEvent } from "react";
import { EuiRadio, EuiSpacer } from "@elastic/eui";
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
    <div style={{ width }}>
      <h5>Rename restored indices</h5>

      <EuiSpacer size="m" />

      <EuiRadio id={do_not_rename} name="rename_option" label="Do not rename" checked={doNotRename} onChange={onDoNotRenameToggle} />

      <EuiSpacer size="s" />

      <EuiRadio
        id={add_prefix}
        name="rename_option"
        label="Add prefix to restored index names"
        checked={addPrefix}
        onChange={onAddPrefixToggle}
      />

      <EuiSpacer size="s" />

      <EuiRadio
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
