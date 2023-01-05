import React from "react";
import { EuiDescribedFormGroup, EuiFormRow, EuiFormRowProps } from "@elastic/eui";

export type CustomFormRowProps = {
  position?: "top" | "bottom";
  direction?: "hoz" | "ver";
} & EuiFormRowProps;

export default function CustomFormRow(props: CustomFormRowProps) {
  const { helpText, children, position = "top", direction = "ver", label, ...others } = props;
  if (direction === "hoz") {
    return (
      <EuiDescribedFormGroup fullWidth title={<div>{label}</div>} description={helpText}>
        <EuiFormRow {...others}>{children}</EuiFormRow>
      </EuiDescribedFormGroup>
    );
  }

  return (
    <EuiFormRow {...others} label={label} helpText={position === "bottom" ? helpText : undefined}>
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
