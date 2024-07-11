/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiSmallButton,
  EuiSmallButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCompressedFormRow,
  EuiFieldText,
} from "@elastic/eui";
import { BrowserServices } from "../../../../models/interfaces";
import { getErrorMessage } from "../../../../utils/helpers";
import { CoreServicesContext } from "../../../../components/core_services";

interface RolloverAliasModalProps {
  onClose: () => void;
  services: BrowserServices;
  index: string;
}

interface RolloverAliasModalState {
  rolloverAlias: string;
}

export default class RolloverAliasModal extends Component<RolloverAliasModalProps, RolloverAliasModalState> {
  static contextType = CoreServicesContext;
  state: RolloverAliasModalState = {
    rolloverAlias: "",
  };

  onEditRolloverAlias = async (): Promise<void> => {
    const {
      onClose,
      index,
      services: { indexService },
    } = this.props;
    const { rolloverAlias } = this.state;
    try {
      const response = await indexService.editRolloverAlias(index, rolloverAlias);
      if (response.ok) {
        if (response.response.acknowledged) {
          this.context.notifications.toasts.addSuccess(`Edited rollover alias on ${index}`);
        } else {
          this.context.notifications.toasts.addDanger(`Failed to edit rollover alias on ${index}`);
        }
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
      onClose();
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `There was a problem editing rollover alias on ${index}`));
    }
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ rolloverAlias: e.target.value });
  };

  render() {
    const { rolloverAlias } = this.state;
    const { onClose } = this.props;
    return (
      <EuiOverlayMask>
        {/*
            // @ts-ignore */}
        <EuiModal onCancel={onClose} onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Edit rollover alias</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiCompressedFormRow label="Rollover alias" helpText="A rollover alias is required when using the rollover action.">
              <EuiFieldText placeholder="Rollover alias" value={rolloverAlias} onChange={this.onChange} />
            </EuiCompressedFormRow>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiSmallButtonEmpty onClick={onClose} data-test-subj="editRolloverAliasModalCloseButton">
              Close
            </EuiSmallButtonEmpty>

            <EuiSmallButton
              onClick={this.onEditRolloverAlias}
              disabled={!rolloverAlias}
              fill
              data-test-subj="editRolloverAliasModalAddButton"
            >
              Edit
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
