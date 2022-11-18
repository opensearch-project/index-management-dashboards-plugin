import React, { useCallback, useMemo } from "react";
import { EuiAccordion, EuiAccordionProps, EuiFormRow, EuiSpacer, EuiFormRowProps } from "@elastic/eui";
import JSONEditor, { JSONEditorProps } from "../JSONEditor";
import "./index.scss";

export interface IAdvancedSettingsProps {
  rowProps?: Omit<EuiFormRowProps, "children">;
  accordionProps?: EuiAccordionProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IAdvancedSettingsProps["value"], key?: string, value?: any) => void;
  renderProps?: (options: Pick<Required<IAdvancedSettingsProps>, "value" | "onChange">) => React.ReactChild;
  editorProps?: Partial<JSONEditorProps>;
}

export default function AdvancedSettings(props: IAdvancedSettingsProps) {
  const { value, renderProps, editorProps } = props;

  const onChangeInRenderProps = useCallback(
    (val: string) => {
      const parsedValue = JSON.parse(val);
      props.onChange && props.onChange(parsedValue, undefined, parsedValue);
    },
    [props.onChange]
  );

  const accordionId = useMemo(() => {
    return props.accordionProps?.id || `${Date.now()}-${Math.floor(Math.random() * 100)}`;
  }, [props.accordionProps?.id]);

  return (
    <>
      <EuiSpacer size="m" />
      <EuiAccordion {...props.accordionProps} className="accordion-in-advanced-settings" id={accordionId}>
        <EuiFormRow {...(props.rowProps as EuiFormRowProps)}>
          {renderProps ? (
            (renderProps({ value: value || {}, onChange: props.onChange || (() => null) }) as any)
          ) : (
            <JSONEditor {...editorProps} value={JSON.stringify(value, null, 2)} onChange={onChangeInRenderProps} />
          )}
        </EuiFormRow>
      </EuiAccordion>
    </>
  );
}
