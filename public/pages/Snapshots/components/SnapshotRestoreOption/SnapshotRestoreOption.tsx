/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedRadio, EuiSpacer } from "@elastic/eui";
import CustomLabel from "../../../../components/CustomLabel";
import { RESTORE_OPTIONS } from "../../../../models/interfaces";
import { EuiText } from "@opensearch-project/oui";

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
    <div>
      <CustomLabel title={"Specify restore option"} />
      <EuiCompressedRadio
        id={restore_all_indices}
        name="restore_option"
        label="Restore all indices in snapshot"
        checked={restoreAllIndices}
        onChange={onRestoreAllIndicesToggle}
      />

      <EuiSpacer size="s" />

      <EuiCompressedRadio
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
