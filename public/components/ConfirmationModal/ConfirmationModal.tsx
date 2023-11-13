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
  EuiButtonEmpty,
  // @ts-ignore
} from "@elastic/eui";

interface ConfirmationModalProps {
  title: string;
  bodyMessage: string | JSX.Element;
  actionMessage: string;
  actionProps?: object;
  modalProps?: object;
  onClose: () => void;
  onAction: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  bodyMessage,
  actionMessage,
  onClose,
  onAction,
  actionProps = {},
  modalProps = {},
}) => {
  return (
    <EuiOverlayMask>
      {/*
      // @ts-ignore */}
      <EuiModal onCancel={onClose} onClose={onClose} maxWidth={1000} {...modalProps}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>{bodyMessage}</EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose} data-test-subj="confirmationModalCloseButton">
            Cancel
          </EuiButtonEmpty>
          <EuiButton
            onClick={() => {
              onAction();
              onClose();
            }}
            fill
            data-test-subj="confirmationModalActionButton"
            {...actionProps}
          >
            {actionMessage}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default ConfirmationModal;
