import React from "react";
import { EuiFormRow, EuiFormRowProps } from "@elastic/eui";

export default function FormGenerator(props: EuiFormRowProps) {
  const { helpText, children, ...others } = props;
  return (
    <EuiFormRow {...others}>
      <>
        {helpText ? (
          <div style={{ paddingTop: 0, paddingBottom: 4 }} className="euiFormHelpText euiFormRow__text">
            {helpText}
          </div>
        ) : null}
        {children}
      </>
    </EuiFormRow>
  );
}
