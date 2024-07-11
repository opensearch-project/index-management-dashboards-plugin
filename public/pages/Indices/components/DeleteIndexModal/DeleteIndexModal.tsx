/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  EuiSmallButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_INDEX } from "../../../../../utils/constants";

interface DeleteIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteIndexModal(props: DeleteIndexModalProps) {
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

  const hasSystemIndex = props.selectedItems.some((index) => filterByMinimatch(index, SYSTEM_INDEX));

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Delete indexes</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {hasSystemIndex ? (
          <>
            <EuiCallOut color="warning">
              These indexes may contain critical system data. Deleting system indexes may break OpenSearch.
            </EuiCallOut>
            <EuiSpacer />
          </>
        ) : null}
        <div style={{ lineHeight: 1.5 }}>
          <p>The following index will be permanently deleted. This action cannot be undone.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
          <EuiText color="subdued">
            To confirm your action, type <b style={{ color: "#000" }}>delete</b>.
          </EuiText>
          <EuiFieldText placeholder="delete" fullWidth value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiSmallButton data-test-subj="Delete Confirm button" onClick={onConfirm} fill color="danger" disabled={value !== "delete"}>
          Delete
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
