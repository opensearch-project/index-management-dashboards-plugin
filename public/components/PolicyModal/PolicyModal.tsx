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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCodeBlock,
  EuiButtonEmpty,
  // @ts-ignore
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";

interface PolicyModalProps {
  policyId: string;
  policy: object | null;
  errorMessage?: string;
  onClose: () => void;
  onEdit: (visual: boolean) => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ policyId, policy, errorMessage, onClose, onEdit }) => {
  const policyString = JSON.stringify(policy, null, 4);
  return (
    <EuiOverlayMask>
      {/*
      // @ts-ignore */}
      <EuiModal onCancel={onClose} onClose={onClose} maxWidth={1000}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{policyId}</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiCodeBlock language="json" fontSize="m" style={{ minWidth: 600 }}>
            {errorMessage != null ? errorMessage : policyString}
          </EuiCodeBlock>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiFlexGroup>
            <EuiFlexItem grow={false} style={{ marginRight: "auto" }}>
              <EuiCopy textToCopy={policyString}>
                {(copy: () => void) => (
                  <EuiButtonEmpty iconType="copyClipboard" onClick={copy} disabled={!policy} data-test-subj="policyModalCopyButton">
                    Copy
                  </EuiButtonEmpty>
                )}
              </EuiCopy>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose} data-test-subj="policyModalCloseButton">
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => onEdit(false)} fill disabled={!policyId || !policy} data-test-subj="policyModalEditJsonButton">
                Edit as JSON
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={() => onEdit(true)} fill disabled={!policyId || !policy} data-test-subj="policyModalEditButton">
                Edit
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default PolicyModal;
