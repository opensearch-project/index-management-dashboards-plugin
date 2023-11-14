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
