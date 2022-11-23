import React, { useCallback, useMemo, useRef } from "react";
import { EuiAccordion, EuiAccordionProps, EuiFormRow, EuiSpacer, EuiFormRowProps } from "@elastic/eui";
import JSONEditor, { JSONEditorProps } from "../JSONEditor";
import "./index.scss";

export interface IAdvancedSettingsProps {
  rowProps?: Omit<EuiFormRowProps, "children">;
  accordionProps?: EuiAccordionProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IAdvancedSettingsProps["value"]) => void;
  renderProps?: (options: Pick<Required<IAdvancedSettingsProps>, "value" | "onChange">) => React.ReactChild;
  editorProps?: Partial<JSONEditorProps>;
}

export default function AdvancedSettings(props: IAdvancedSettingsProps) {
  const { value, renderProps, editorProps } = props;
  const propsRef = useRef<IAdvancedSettingsProps>(props);
  propsRef.current = props;

  const onChangeInRenderProps = useCallback(
    (val: string) => {
      const parsedValue = JSON.parse(val);
      propsRef.current.onChange && propsRef.current.onChange(parsedValue);
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
            (renderProps({
              value: propsRef.current.value || {},
              onChange: (val) => {
                if (propsRef.current?.onChange) {
                  propsRef.current?.onChange(val);
                }
              },
            }) as any)
          ) : (
            <JSONEditor {...editorProps} value={JSON.stringify(value, null, 2)} onChange={onChangeInRenderProps} />
          )}
        </EuiFormRow>
      </EuiAccordion>
    </>
  );
}
