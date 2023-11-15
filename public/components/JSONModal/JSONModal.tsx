/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCodeBlock,
  EuiButtonEmpty,
} from "@elastic/eui";

interface JSONModalProps {
  title: string;
  json: object;
  onClose: () => void;
}

const JSONModal: React.FC<JSONModalProps> = ({ title, json, onClose }) => {
  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiCodeBlock language="json" fontSize="m" paddingSize="m" inline={false} isCopyable>
            {JSON.stringify(json, null, 4)}
          </EuiCodeBlock>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose} data-test-subj="jsonModalCloseButton">
            Close
          </EuiButtonEmpty>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default JSONModal;
