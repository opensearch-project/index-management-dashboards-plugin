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

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from "@elastic/eui";
import React from "react";

interface CustomLabelProps {
  title: string;
  isOptional?: boolean;
  helpText?: string | JSX.Element;
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
            <i> – optional</i>
          </EuiText>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    {helpText && typeof helpText === "string" ? <span style={{ fontWeight: 200, fontSize: "12px" }}>{helpText}</span> : helpText}

    <EuiSpacer size="s" />
  </>
);

export default CustomLabel;
