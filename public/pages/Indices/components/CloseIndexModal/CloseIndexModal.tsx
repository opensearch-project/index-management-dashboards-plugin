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

import React, { useEffect, useState } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
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
        <EuiModalHeaderTitle>Close indices</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <>
          <EuiCallOut color="warning" hidden={!showWarning}>
            This index may contain critical system data. Closing system indexes may break OpenSearch.
          </EuiCallOut>
          <EuiSpacer />
        </>
        <div style={{ lineHeight: 1.5 }}>
          <p>The following index will be closed. It is not possible to index documents or to search for documents in a closed index.</p>
          <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
            {selectedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <EuiSpacer />
          <EuiText color="subdued">
            To confirm your action, type <b style={{ color: "#000" }}>close</b>.
          </EuiText>
          <EuiFieldText placeholder="close" fullWidth value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="Close Cancel button" onClick={onClose}>
          Cancel
        </EuiButtonEmpty>
        <EuiButton data-test-subj="Close Confirm button" onClick={onConfirm} fill disabled={value !== "close"}>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
