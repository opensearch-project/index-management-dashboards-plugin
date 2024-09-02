/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import React from "react";

interface CustomLabelProps {
  title: string | JSX.Element;
  isOptional?: boolean;
  helpText?: string | JSX.Element;
  checkboxLable?: boolean;
}

const CustomLabel = ({ title, isOptional = false, helpText, checkboxLable = false }: CustomLabelProps) => (
  <>
    {title && typeof title == "string" ? (
      <EuiFlexGroup gutterSize="xs" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText size="s">{checkboxLable ? <h4>{title}</h4> : <h3>{title}</h3>}</EuiText>
        </EuiFlexItem>

        {isOptional ? (
          <EuiFlexItem>
            <EuiText color="subdued">
              x<i> – optional</i>
            </EuiText>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    ) : (
      title
    )}

    {helpText && typeof helpText === "string" ? <span style={{ fontWeight: 200, fontSize: "12px" }}>{helpText}</span> : helpText}

    {checkboxLable ? null : <EuiSpacer size="s" />}
  </>
);

export default CustomLabel;
