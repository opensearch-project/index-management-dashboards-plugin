/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiRadio, EuiSpacer } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import React, { ChangeEvent } from "react";

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
}: SnapshotRestoreOptionProps) => (
  <div style={{ width: width }}>
    <h5>Specify restore option</h5>

    <EuiSpacer size="m" />

    <EuiRadio
      id="restore_all_indices"
      name="restore_option"
      label={<CustomLabel title="Restore all indices in snapshot" />}
      checked={restoreAllIndices}
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
  </div>
);

export default SnapshotRestoreOption;
