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
}

const FlyoutFooter = ({ edit, action, disabledAction = false, onClickCancel, onClickAction }: FlyoutFooterProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onClickCancel} flush="left" data-test-subj="flyout-footer-cancel-button">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton disabled={disabledAction} onClick={onClickAction} fill data-test-subj="flyout-footer-action-button">
        {`${edit ? "Edit" : "Add"} ${action}`}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default FlyoutFooter;
