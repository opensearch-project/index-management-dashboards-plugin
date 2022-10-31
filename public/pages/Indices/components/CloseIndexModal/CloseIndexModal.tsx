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

interface CloseIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default class CloseIndexModal extends Component<CloseIndexModalProps> {
  state: {
    value: string;
  } = {
    value: "",
  };
  componentWillReceiveProps(nextProps: CloseIndexModalProps) {
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
          <EuiModalHeaderTitle>Close indices</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <div style={{ lineHeight: 1.5 }}>
            <p>The following index will be closed. It is not possible to index documents or to search for documents in a closed index.</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {this.props.selectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <EuiSpacer />
            <EuiText color="subdued">
              To confirm your action, type <b style={{ color: "#000" }}>close</b>.
            </EuiText>
            <EuiFieldText
              placeholder="close"
              fullWidth
              value={this.state.value}
              onChange={(e) => this.setState({ value: e.target.value })}
            />
          </div>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
          <EuiButton data-test-subj="Close Confirm button" onClick={onConfirm} fill disabled={this.state.value !== "close"}>
            Close
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }
}
