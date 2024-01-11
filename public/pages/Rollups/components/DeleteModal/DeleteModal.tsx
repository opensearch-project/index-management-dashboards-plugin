/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, Fragment } from "react";
import { EuiConfirmModal, EuiForm, EuiFormRow, EuiFieldText, EuiOverlayMask, EuiSpacer } from "@elastic/eui";

interface DeleteModalProps {
  rollupId: string;
  closeDeleteModal: (event?: any) => void;
  onClickDelete: (event?: any) => void;
}

interface DeleteModalState {
  confirmDeleteText: string;
}

export default class DeleteModal extends Component<DeleteModalProps, DeleteModalState> {
  state = { confirmDeleteText: "" };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ confirmDeleteText: e.target.value });
  };

  render() {
    const { rollupId, closeDeleteModal, onClickDelete } = this.props;
    const { confirmDeleteText } = this.state;

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title="Delete job(s)"
          onCancel={closeDeleteModal}
          onConfirm={onClickDelete}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText !== "delete"}
        >
          <EuiForm>
            <Fragment>
              By deleting &quot;<strong>{rollupId}</strong>&quot;, all future scheduled rollup execution will be canceled. However, your
              target index will remain as it is.
            </Fragment>
            <EuiSpacer size="s" />
            <EuiFormRow helpText="To confirm deletion, enter delete in the text field">
              <EuiFieldText value={confirmDeleteText} placeholder="delete" onChange={this.onChange} data-test-subj="deleteTextField" />
            </EuiFormRow>
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
