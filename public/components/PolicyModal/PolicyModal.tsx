/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiSmallButton,
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

const PolicyModal: React.SFC<PolicyModalProps> = ({ policyId, policy, errorMessage, onClose, onEdit }) => {
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
              <EuiSmallButton onClick={() => onEdit(false)} fill disabled={!policyId || !policy} data-test-subj="policyModalEditJsonButton">
                Edit as JSON
              </EuiSmallButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton onClick={() => onEdit(true)} fill disabled={!policyId || !policy} data-test-subj="policyModalEditButton">
                Edit
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default PolicyModal;
