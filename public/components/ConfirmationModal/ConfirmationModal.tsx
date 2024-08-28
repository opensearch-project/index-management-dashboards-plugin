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
  EuiSmallButtonEmpty,
  EuiText,
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

const ConfirmationModal: React.SFC<ConfirmationModalProps> = ({
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
          <EuiModalHeaderTitle>
            <EuiText size="s">
              <h2>{title}</h2>
            </EuiText>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText size="s">
            <p>{bodyMessage}</p>
          </EuiText>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiSmallButtonEmpty onClick={onClose} data-test-subj="confirmationModalCloseButton">
            Cancel
          </EuiSmallButtonEmpty>
          <EuiSmallButton
            onClick={() => {
              onAction();
              onClose();
            }}
            fill
            data-test-subj="confirmationModalActionButton"
            {...actionProps}
          >
            {actionMessage}
          </EuiSmallButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default ConfirmationModal;
