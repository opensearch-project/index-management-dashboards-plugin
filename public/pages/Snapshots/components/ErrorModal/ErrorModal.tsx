/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiModal, EuiText, EuiButton, EuiModalHeader, EuiModalFooter, EuiModalBody, EuiModalHeaderTitle } from "@elastic/eui";
import React from "react";
import { RestoreError } from "../../../../models/interfaces"


interface ErrorModalProps {
  error: RestoreError;
  onClick: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement> | undefined) => void;
  onClose: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement> | undefined) => void;
}

const ErrorModal = ({ onClick, error }: ErrorModalProps) => {

  return (
    <>
      <EuiModal onClose={onClick}>
        <EuiModalHeader color="danger" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <EuiModalHeaderTitle><h1>{error.type ? error.type : ""}</h1></EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText size="m" color="danger">{error.reason ? error.reason : error}.</EuiText>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButton onClick={onClick} fill>Close</EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </>
  );
};

export default ErrorModal;