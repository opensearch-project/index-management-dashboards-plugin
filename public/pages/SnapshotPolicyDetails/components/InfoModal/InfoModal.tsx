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
} from "@elastic/eui";

interface InfoModalProps {
  info: object;
  onClose: () => void;
}

const InfoModal = ({ info, onClose }: InfoModalProps) => (
  <EuiOverlayMask>
    <EuiModal onClose={onClose} maxWidth={1000}>
      <EuiModalHeader>
        <EuiModalHeaderTitle> </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiCodeBlock language="json" fontSize="m">
          {JSON.stringify(info, null, 4)}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton fill onClick={onClose} data-test-subj="infoModalCloseButton">
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export default InfoModal;
