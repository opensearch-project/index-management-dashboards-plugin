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
