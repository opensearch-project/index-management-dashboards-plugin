/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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

const JSONModal: React.SFC<JSONModalProps> = ({ title, json, onClose }) => {
  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} style={{ padding: "5px 30px" }}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
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
