/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import React from "react";

interface CustomLabelProps {
  title: string;
  isOptional?: boolean;
  helpText?: string;
}

const CustomLabel = ({ title, isOptional = false, helpText }: CustomLabelProps) => (
  <>
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiText size="xs">
          <h4>{title}</h4>
        </EuiText>
      </EuiFlexItem>

      {isOptional ? (
        <EuiFlexItem>
          <EuiText size="xs" color="subdued">
            <i> - optional</i>
          </EuiText>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    {helpText && <span style={{ fontWeight: 200, fontSize: "12px" }}>{helpText}</span>}

    <EuiSpacer size="s" />
  </>
);

export default CustomLabel;
