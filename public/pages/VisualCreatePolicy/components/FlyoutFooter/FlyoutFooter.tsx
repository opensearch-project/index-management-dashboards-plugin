/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiButton } from "@elastic/eui";

interface FlyoutFooterProps {
  edit: boolean;
  action: string;
  disabledAction?: boolean;
  onClickCancel: () => void;
  onClickAction: () => void;
  save?: boolean;
  restore?: boolean;
}

const FlyoutFooter = ({ edit, action, disabledAction = false, onClickCancel, onClickAction, save, restore }: FlyoutFooterProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onClickCancel} flush="left" data-test-subj="flyout-footer-cancel-button">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton disabled={disabledAction} onClick={onClickAction} fill data-test-subj="flyout-footer-action-button">
        {restore ? "Restore snapshot" : !save ? `${edit ? "Edit" : "Add"} ${action}` : save ? "Save" : "Create"}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default FlyoutFooter;
