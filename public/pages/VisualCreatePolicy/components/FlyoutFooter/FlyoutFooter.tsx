/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiSmallButton } from "@elastic/eui";

interface FlyoutFooterProps {
  edit: boolean;
  action: string;
  disabledAction?: boolean;
  onClickCancel: () => void;
  onClickAction: () => void;
  save?: boolean;
  restore?: boolean;
  text?: string;
}

const FlyoutFooter = ({ edit, action, disabledAction = false, onClickCancel, onClickAction, save, restore, text }: FlyoutFooterProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onClickCancel} flush="left" data-test-subj="flyout-footer-cancel-button">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiSmallButton disabled={disabledAction} onClick={onClickAction} fill data-test-subj="flyout-footer-action-button">
        {text ? text : restore ? "Restore snapshot" : !save ? `${edit ? "Edit" : "Add"} ${action}` : save ? "Save" : "Create"}
      </EuiSmallButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default FlyoutFooter;
