/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiButton } from "@elastic/eui";

interface ActionFooterProps {
  editAction: boolean;
  onClickCancelAction: () => void;
  onClickAddAction: () => void;
}

const ActionFooter = ({ editAction, onClickCancelAction, onClickAddAction }: ActionFooterProps) => (
  <EuiFlexGroup justifyContent="spaceBetween">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty iconType="cross" onClick={() => onClickCancelAction()} flush="left">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton onClick={() => onClickAddAction()} fill>
        {`${editAction ? "Edit" : "Add"} action`}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default ActionFooter;
