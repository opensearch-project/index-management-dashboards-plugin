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

interface OpenIndexModalProps {
  selectedItems: string[];
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default class OpenIndexModal extends Component<OpenIndexModalProps> {
  state: {
    value: string;
  } = {
    value: "",
  };
  componentWillReceiveProps(nextProps: OpenIndexModalProps) {
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
          <EuiModalHeaderTitle>Open indices</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <div style={{ lineHeight: 1.5 }}>
            <p>The following index will be opened.</p>
            <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
              {this.props.selectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <EuiSpacer />
          </div>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
          <EuiButton data-test-subj="Open Confirm button" onClick={onConfirm} fill>
            Open
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    );
  }
}
