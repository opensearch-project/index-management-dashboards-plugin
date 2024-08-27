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
  EuiText,
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
        <EuiModalHeaderTitle>
          <EuiText size="s">
            <h2>Open indexes</h2>
          </EuiText>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <EuiText size="s">
            The following index will be opened.
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {selectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EuiText>
          <EuiSpacer />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Open Cancel button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Open Confirm button" onClick={onConfirm} fill>
          Open
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
