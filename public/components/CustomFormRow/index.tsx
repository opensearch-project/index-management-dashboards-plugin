/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiDescribedFormGroup, EuiCompressedFormRow, EuiFormRowProps } from "@elastic/eui";

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
        {children ? <EuiCompressedFormRow {...others}>{children}</EuiCompressedFormRow> : null}
      </EuiDescribedFormGroup>
    );
  }

  return (
    <EuiCompressedFormRow
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
    </EuiCompressedFormRow>
  );
}
