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
  EuiText,
} from "@elastic/eui";
import { wrapQuotesAroundTransformId } from "../../../CreateTransform/utils/helpers";

interface ErrorModalProps {
  metadata: object;
  onClose: () => void;
}

const ErrorModal = ({ metadata, onClose }: ErrorModalProps) => (
  <EuiOverlayMask>
    {/*
      // @ts-ignore */}
    <EuiModal onCancel={onClose} onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText>
          {wrapQuotesAroundTransformId(metadata.transform_metadata.transform_id, metadata.transform_metadata.failure_reason)}
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton fill onClick={onClose} data-test-subj="errorModalCloseButton">
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  </EuiOverlayMask>
);

export default ErrorModal;
