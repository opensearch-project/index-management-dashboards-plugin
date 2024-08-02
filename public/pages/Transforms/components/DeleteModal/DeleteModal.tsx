/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component, Fragment } from "react";
import { EuiConfirmModal, EuiForm, EuiCompressedFormRow, EuiCompressedFieldText, EuiOverlayMask, EuiSpacer } from "@elastic/eui";

// TODO: Merge with Rollup to create generic component
interface DeleteModalProps {
  item: string;
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
    const { item, closeDeleteModal, onClickDelete } = this.props;
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
          confirmButtonDisabled={confirmDeleteText != "delete"}
        >
          <EuiForm>
            <Fragment>
              By deleting <strong>{item}</strong>, all future scheduled executions will be canceled. However, your target index and data in
              it will remain intact.
            </Fragment>
            <EuiSpacer size="s" />
            <EuiCompressedFormRow helpText="To confirm deletion, enter delete in the text field">
              <EuiCompressedFieldText
                value={confirmDeleteText}
                placeholder="delete"
                onChange={this.onChange}
                data-test-subj="deleteTextField"
              />
            </EuiCompressedFormRow>
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
