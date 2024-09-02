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
  EuiCallOut,
  EuiText,
} from "@elastic/eui";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_INDEX } from "../../../../../utils/constants";

interface CloseIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CloseIndexModal(props: CloseIndexModalProps) {
  const [value, setValue] = useState("");
  const { onClose, onConfirm, visible, selectedItems } = props;
  useEffect(() => {
    if (visible) {
      setValue("");
    }
  }, [visible]);
  if (!visible) {
    return null;
  }

  const showWarning = selectedItems.filter((item) => filterByMinimatch(item as string, SYSTEM_INDEX)).length > 0;

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiText size="s">
            <h2>Close indexes</h2>
          </EuiText>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <>
          <EuiCallOut color="warning" size="s" hidden={!showWarning}>
            This index may contain critical system data. Closing system indexes may break OpenSearch.
            <EuiSpacer />
          </EuiCallOut>
        </>
        <div style={{ lineHeight: 1.5 }}>
          <EuiText size="s">
            <p>The following index will be closed. It is not possible to index documents or to search for documents in a closed index.</p>
          </EuiText>
          <EuiText size="s">
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {selectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </EuiText>
          <EuiSpacer />
          <EuiText color="subdued" size="s">
            To confirm your action, type <b style={{ color: "#000" }}>close</b>.
          </EuiText>
          <EuiCompressedFieldText placeholder="close" fullWidth value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButtonEmpty data-test-subj="Close Cancel button" onClick={onClose}>
          Cancel
        </EuiSmallButtonEmpty>
        <EuiSmallButton data-test-subj="Close Confirm button" onClick={onConfirm} fill disabled={value !== "close"}>
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
