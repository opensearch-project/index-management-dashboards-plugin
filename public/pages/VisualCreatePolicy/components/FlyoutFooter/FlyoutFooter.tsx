/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
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
}

const FlyoutFooter = ({ edit, action, disabledAction = false, onClickCancel, onClickAction, save, restore, text }: FlyoutFooterProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onClickCancel} flush="left" data-test-subj="flyout-footer-cancel-button">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton disabled={disabledAction} onClick={onClickAction} fill data-test-subj="flyout-footer-action-button">
        {text ? text : restore ? "Restore snapshot" : !save ? `${edit ? "Edit" : "Add"} ${action}` : save ? "Save" : "Create"}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default FlyoutFooter;
