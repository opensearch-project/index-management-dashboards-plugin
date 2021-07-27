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

interface TransitionFooterProps {
  editTransition: boolean;
  onClickCancelTransition: () => void;
  onClickAddTransition: () => void;
}

const TransitionFooter = ({ editTransition, onClickCancelTransition, onClickAddTransition }: TransitionFooterProps) => (
  <EuiFlexGroup justifyContent="spaceBetween">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty iconType="cross" onClick={() => onClickCancelTransition()} flush="left">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton onClick={() => onClickAddTransition()} fill>
        {`${editTransition ? "Edit" : "Add"} transition`}
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default TransitionFooter;
