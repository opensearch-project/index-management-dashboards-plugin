import React from "react";
import { EuiFormRow, EuiFormRowProps } from "@elastic/eui";

export type CustomFormRowProps = {
  position?: "top" | "bottom";
} & EuiFormRowProps;

export default function CustomFormRow(props: CustomFormRowProps) {
  const { helpText, children, position = "top", ...others } = props;
  return (
    <EuiFormRow {...others} helpText={position === "bottom" ? helpText : undefined}>
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
