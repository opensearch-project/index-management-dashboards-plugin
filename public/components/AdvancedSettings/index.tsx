import React, { useMemo } from "react";
import { EuiAccordion, EuiAccordionProps, EuiFormRow, EuiSpacer, EuiFormRowProps } from "@elastic/eui";
import JSONEditor from "../JSONEditor";

export interface IAdvancedSettingsProps {
  rowProps?: Omit<EuiFormRowProps, "children">;
  accordionProps?: EuiAccordionProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IAdvancedSettingsProps["value"], key?: string, value?: any) => void;
}

export default function AdvancedSettings(props: IAdvancedSettingsProps) {
  const { value } = props;

  const accordionId = useMemo(() => {
    return props.accordionProps?.id || `${Date.now()}-${Math.floor(Math.random() * 100)}`;
  }, [props.accordionProps?.id]);

  return (
    <>
      <EuiSpacer size="m" />
      <EuiAccordion {...props.accordionProps} id={accordionId}>
        <EuiSpacer size="m" />
        <EuiFormRow {...(props.rowProps as EuiFormRowProps)}>
          <JSONEditor
            value={JSON.stringify(value, null, 2)}
            onChange={(val: string) => {
              const parsedValue = JSON.parse(val);
              props.onChange && props.onChange(parsedValue, undefined, parsedValue);
            }}
          />
        </EuiFormRow>
      </EuiAccordion>
    </>
  );
}
