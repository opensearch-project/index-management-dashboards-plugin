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
  EuiText,
} from "@elastic/eui";

interface InfoModalProps {
  info: object;
  onClose: () => void;
}

const InfoModal = ({ info, onClose }: InfoModalProps) => (
  <EuiOverlayMask>
    {/*
      // @ts-ignore */}
    <EuiModal onCancel={onClose} onClose={onClose} maxWidth={1000}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <EuiText size="s">
            <h2>Managed Index Info</h2>
          </EuiText>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiCodeBlock language="json" fontSize="s">
          {JSON.stringify(info, null, 4)}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiSmallButton fill onClick={onClose} data-test-subj="infoModalCloseButton">
          Close
        </EuiSmallButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export default InfoModal;
