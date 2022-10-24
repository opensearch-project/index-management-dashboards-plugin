/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";

interface DeleteIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default class DeleteIndexModal extends Component<DeleteIndexModalProps> {
  state: {
    value: string;
  } = {
    value: "",
  };
  componentWillReceiveProps(nextProps: DeleteIndexModalProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.setState({
        value: "",
      });
    }
  }
  render() {
    const { onClose, onConfirm, visible } = this.props;
    if (!visible) {
      return null;
    }

    return (
      <EuiModal onClose={onClose}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>Delete indices</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <div style={{ lineHeight: 1.5 }}>
            <p>The following index will be deleted permanently. This action cannot be undone.</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {this.props.selectedItems.map((item) => (
                <li>{item}</li>
              ))}
            </ul>
            <EuiSpacer />
            <EuiText color="subdued">
              To confirm your action, type <b style={{ color: "#000" }}>delete</b>.
            </EuiText>
            <EuiFieldText
              placeholder="delete"
              fullWidth
              value={this.state.value}
              onChange={(e) => this.setState({ value: e.target.value })}
            />
          </div>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
          <EuiButton onClick={onConfirm} fill color="danger" disabled={this.state.value !== "delete"}>
            Delete
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }
}
