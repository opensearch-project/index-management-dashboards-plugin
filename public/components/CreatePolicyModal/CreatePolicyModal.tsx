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

import React, { useState } from "react";
import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiRadio,
  EuiPanel,
} from "@elastic/eui";
import * as H from "history";

interface CreatePolicyModalProps {
  isEdit?: boolean;
  history: H.History;
  onClose: () => void;
  onClickContinue: (visual: boolean) => void;
}

const CreatePolicyModal: React.SFC<CreatePolicyModalProps> = ({ isEdit = false, onClose, history, onClickContinue }) => {
  const [visual, setVisual] = useState(true);
  return (
    <EuiOverlayMask>
      {/*
      // @ts-ignore */}
      <EuiModal onCancel={onClose} onClose={onClose} maxWidth={600}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Configuration method</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiFlexGroup gutterSize="m" direction="column" style={{ margin: "-4px" }}>
            <EuiFlexItem grow={false}>
              <EuiText size="s" style={{ marginTop: 0 }}>
                Choose how you would like to {isEdit ? "modify" : "define"} your policy, either using a visual editor or writing JSON.
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiPanel className={visual ? "selected-radio-panel" : ""}>
                    <EuiFormRow
                      helpText={`Use the visual editor to ${isEdit ? "update" : "create"} your policy${
                        isEdit ? "" : " using pre-defined options."
                      }`}
                    >
                      <EuiRadio
                        id="create-policy-visual"
                        label="Visual editor"
                        checked={visual}
                        onChange={(e) => setVisual(e.target.checked)}
                        data-test-subj="createPolicyModalVisualRadio"
                      />
                    </EuiFormRow>
                  </EuiPanel>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiPanel className={visual ? "" : "selected-radio-panel"}>
                    <EuiFormRow helpText={`Use the JSON editor to ${isEdit ? "update" : "create or import"} your policy using JSON.`}>
                      <EuiRadio
                        id="create-policy-json"
                        label="JSON editor"
                        checked={!visual}
                        onChange={(e) => setVisual(!e.target.checked)}
                        data-test-subj="createPolicyModalJsonRadio"
                      />
                    </EuiFormRow>
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose} data-test-subj="createPolicyModalCancelButton">
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => {
                  onClose();
                  onClickContinue(visual);
                }}
                fill
                data-test-subj="createPolicyModalContinueButton"
              >
                Continue
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default CreatePolicyModal;
