/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";

interface FlushIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function FlushIndexModal(props: FlushIndexModalProps) {
  const { onClose, onConfirm, visible, selectedItems } = props;
  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Flush indices</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>The following index will be flushed.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Flush Cancel button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Flush Confirm button" onClick={onConfirm} fill>
          Flush
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
