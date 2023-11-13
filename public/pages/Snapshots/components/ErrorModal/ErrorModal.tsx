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

import { EuiModal, EuiText, EuiButton, EuiModalHeader, EuiModalFooter, EuiModalBody, EuiModalHeaderTitle } from "@elastic/eui";
import React from "react";
import { RestoreError } from "../../../../models/interfaces";

interface ErrorModalProps {
  error: RestoreError;
  snapshotId: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement> | undefined) => void;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement> | undefined) => void;
}

const ErrorModal = ({ onClick, error, snapshotId }: ErrorModalProps) => {
  return (
    <>
      <EuiModal onClose={onClick}>
        <EuiModalHeader color="danger" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <EuiModalHeaderTitle>
            <h1>{`Failed to restore snapshot ${snapshotId}`}</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiText size="m" color="danger">
            {error.reason ?? error}.
          </EuiText>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButton onClick={onClick} fill>
            Close
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </>
  );
};

export default ErrorModal;
