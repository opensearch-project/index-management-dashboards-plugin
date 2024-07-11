/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import { EuiConfirmModal, EuiCompressedFieldText, EuiForm, EuiCompressedFormRow, EuiOverlayMask, EuiSpacer } from "@elastic/eui";

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
          confirmButtonDisabled={confirmDeleteText != "delete"}
        >
          <EuiForm>
            <p>
              Delete "<strong>{ids}</strong>" permanently? {addtionalWarning}
            </p>
            <EuiSpacer size="s" />
            {!!confirmation && (
              <EuiCompressedFormRow helpText={`To confirm deletion, type "delete".`}>
                <EuiCompressedFieldText
                  value={confirmDeleteText}
                  placeholder="delete"
                  onChange={this.onChange}
                  data-test-subj="deleteTextField"
                />
              </EuiCompressedFormRow>
            )}
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
