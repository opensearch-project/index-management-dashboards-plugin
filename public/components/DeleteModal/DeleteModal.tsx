/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiCompressedFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";

interface DeleteModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  tips: string;
}

export default function DeleteTemplateModal(props: DeleteModalProps) {
  const [value, setValue] = useState("");
  const { onClose, visible, selectedItems, onConfirm } = props;
  useEffect(() => {
    if (visible) {
      setValue("");
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>{props.title}</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <div style={{ lineHeight: 1.5 }}>
          <p>{props.tips}</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
          <EuiText color="subdued">
            To confirm your action, type <b style={{ color: "#000" }}>delete</b>.
          </EuiText>
          <EuiCompressedFieldText
            data-test-subj="deleteInput"
            placeholder="delete"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButtonEmpty data-test-subj="deletaCancelButton" onClick={onClose}>
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton data-test-subj="deleteConfirmButton" onClick={onConfirm} fill color="danger" disabled={value !== "delete"}>
          Delete
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
