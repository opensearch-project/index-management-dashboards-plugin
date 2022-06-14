/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiSpacer, EuiSwitch, EuiSwitchEvent, EuiText } from "@elastic/eui";

interface ToggleWrapperProps {
  label: any;
  checked: boolean;
  onSwitchChange: (event: EuiSwitchEvent) => void;
}

const ToggleWrapper = ({ label, checked, onSwitchChange }: ToggleWrapperProps) => (
  <EuiFlexGroup>
    <EuiFlexItem grow={1}>{label}</EuiFlexItem>
    <EuiFlexItem grow={2}>
      <EuiFormRow>
        <EuiSwitch label="" checked={checked} onChange={onSwitchChange} />
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default ToggleWrapper;
