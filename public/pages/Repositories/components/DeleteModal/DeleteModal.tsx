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

import React, { ChangeEvent, Component } from "react";
import { EuiConfirmModal, EuiFieldText, EuiForm, EuiFormRow, EuiOverlayMask, EuiSpacer } from "@elastic/eui";

interface DeleteModalProps {
  closeDeleteModal: (event?: any) => void;
  onClickDelete: (event?: any) => void;
  type: string;
  ids: string;
  addtionalWarning?: string;
  confirmation?: boolean;
}

interface DeleteModalState {
  confirmDeleteText: string;
}

export default class DeleteModal extends Component<DeleteModalProps, DeleteModalState> {
  constructor(props: DeleteModalProps) {
    super(props);

    let confirmDeleteText = "delete";
    if (props.confirmation) confirmDeleteText = "";
    this.state = {
      confirmDeleteText,
    };
  }

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ confirmDeleteText: e.target.value });
  };

  render() {
    const { type, ids, closeDeleteModal, onClickDelete, addtionalWarning, confirmation } = this.props;
    const { confirmDeleteText } = this.state;

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title={`Delete ${type}`}
          onCancel={closeDeleteModal}
          onConfirm={() => {
            onClickDelete();
            closeDeleteModal();
          }}
          cancelButtonText="Cancel"
          confirmButtonText={`Delete ${type}`}
          buttonColor="danger"
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText !== "delete"}
        >
          <EuiForm>
            <p>
              Delete &quot;<strong>{ids}</strong>&quot; permanently? {addtionalWarning}
            </p>
            <EuiSpacer size="s" />
            {!!confirmation && (
              <EuiFormRow helpText={`To confirm deletion, type "delete".`}>
                <EuiFieldText value={confirmDeleteText} placeholder="delete" onChange={this.onChange} data-test-subj="deleteTextField" />
              </EuiFormRow>
            )}
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
