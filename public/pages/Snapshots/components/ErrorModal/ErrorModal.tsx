/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiModal, EuiText, EuiButton, EuiModalHeader, EuiModalFooter, EuiModalBody, EuiModalHeaderTitle } from "@elastic/eui";
import React from "react";


interface ErrorModalProps {
  error: React.ErrorInfo;
  onClick: (e: React.MouseEvent) => void;
}

const ErrorModal = ({ onClick, error }: ErrorModalProps) => {


  const newError = JSON.parse(error.error).error;
  const status = JSON.parse(error.error).status;
  const helpText = status === 500 ? "Internal server error" : "Invalid request"
  return (
    <>
      <EuiModal onClose={onClick}>
        <EuiModalHeader color="danger" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <EuiModalHeaderTitle><h1>{newError.type}</h1></EuiModalHeaderTitle>
          <EuiText>{`Status code: ${status} - ${helpText}`}</EuiText>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText size="m" color="danger">{newError.reason}.</EuiText>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButton onClick={onClick} fill>Close</EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </>
  );
};

export default ErrorModal;