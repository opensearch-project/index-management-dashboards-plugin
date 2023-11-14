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

interface SnapshotRestoreOptionProps {
  restoreAllIndices: boolean;
  onRestoreAllIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  restoreSpecificIndices: boolean;
  onRestoreSpecificIndicesToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  width: string;
}

const SnapshotRestoreOption = ({
  restoreAllIndices,
  onRestoreAllIndicesToggle,
  restoreSpecificIndices,
  onRestoreSpecificIndicesToggle,
  width,
}: SnapshotRestoreOptionProps) => {
  const { restore_all_indices, restore_specific_indices } = RESTORE_OPTIONS;

  return (
    <div style={{ width }}>
      <h5>Specify restore option</h5>

      <EuiSpacer size="m" />

      <EuiRadio
        id={restore_all_indices}
        name="restore_option"
        label="Restore all indices in snapshot"
        checked={restoreAllIndices}
        onChange={onRestoreAllIndicesToggle}
      />

      <EuiSpacer size="s" />

      <EuiRadio
        id={restore_specific_indices}
        name="restore_option"
        label="Restore specific indices"
        checked={restoreSpecificIndices}
        onChange={onRestoreSpecificIndicesToggle}
      />
    </div>
  );
};

export default SnapshotRestoreOption;
