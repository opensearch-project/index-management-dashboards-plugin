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
  text?: string;
  useNewUx?: boolean;
}

const FlyoutFooter = ({
  edit,
  action,
  disabledAction = false,
  onClickCancel,
  onClickAction,
  save,
  restore,
  text,
  useNewUx,
}: FlyoutFooterProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty size={useNewUx ? "s" : undefined} onClick={onClickCancel} flush="left" data-test-subj="flyout-footer-cancel-button">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton
        size={useNewUx ? "s" : undefined}
        disabled={disabledAction}
        onClick={onClickAction}
        fill
        data-test-subj="flyout-footer-action-button"
      >
        {text ? text : restore ? "Restore snapshot" : !save ? `${edit ? "Edit" : "Add"} ${action}` : save ? "Save" : "Create"}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default FlyoutFooter;
