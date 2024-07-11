/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
} from "@elastic/eui";

interface OpenIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OpenIndexModal(props: OpenIndexModalProps) {
  const { onClose, onConfirm, visible, selectedItems } = props;
  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Open indexes</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>The following index will be opened.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButtonEmpty data-test-subj="Open Cancel button" onClick={onClose}>
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton data-test-subj="Open Confirm button" onClick={onConfirm} fill>
          Open
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
