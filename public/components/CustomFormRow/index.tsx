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
import React from "react";
import { EuiDescribedFormGroup, EuiFormRow, EuiFormRowProps } from "@elastic/eui";

export type CustomFormRowProps = {
  position?: "top" | "bottom";
  direction?: "hoz" | "ver";
  isOptional?: boolean;
} & Partial<EuiFormRowProps>;

export function OptionalLabel() {
  return <i> – optional</i>;
}

export default function CustomFormRow(props: CustomFormRowProps) {
  const { helpText, children, position = "top", direction = "ver", label, isOptional, ...others } = props;
  if (direction === "hoz") {
    return (
      <EuiDescribedFormGroup
        fullWidth
        descriptionFlexItemProps={{ style: { maxWidth: 700 } }}
        title={
          <div>
            {label}
            {isOptional ? <OptionalLabel /> : null}
          </div>
        }
        description={helpText}
      >
        {children ? <EuiFormRow {...others}>{children}</EuiFormRow> : null}
      </EuiDescribedFormGroup>
    );
  }

  return (
    <EuiFormRow
      {...others}
      label={
        isOptional ? (
          <>
            {label}
            <OptionalLabel />
          </>
        ) : (
          label
        )
      }
      helpText={position === "bottom" ? helpText : undefined}
    >
      <>
        {helpText && position === "top" ? (
          <div style={{ paddingTop: 0, paddingBottom: 4 }} className="euiFormHelpText euiFormRow__text">
            {helpText}
          </div>
        ) : null}
        {children}
      </>
    </EuiFormRow>
  );
}
