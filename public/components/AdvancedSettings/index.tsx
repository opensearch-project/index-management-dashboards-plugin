import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { EuiAccordion, EuiAccordionProps, EuiFormRow, EuiSpacer, EuiFormRowProps } from "@elastic/eui";
import JSONEditor, { IJSONEditorRef, JSONEditorProps } from "../JSONEditor";
import CustomFormRow from "../CustomFormRow";
import "./index.scss";
import CustomFormRow from "../CustomFormRow";

export interface IAdvancedSettingsProps {
  rowProps?: Omit<EuiFormRowProps, "children">;
  accordionProps?: EuiAccordionProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IAdvancedSettingsProps["value"]) => void;
  renderProps?: (
    options: Pick<Required<IAdvancedSettingsProps>, "value" | "onChange"> & { ref: React.Ref<IJSONEditorRef> }
  ) => React.ReactChild;
  editorProps?: Partial<JSONEditorProps>;
}

export interface IAdvancedSettingsRef {
  validate: () => Promise<string>;
}

export default forwardRef(function AdvancedSettings(props: IAdvancedSettingsProps, ref: React.Ref<IAdvancedSettingsRef>) {
  const { value, renderProps, editorProps } = props;
  const propsRef = useRef<IAdvancedSettingsProps>(props);
  const editorRef = useRef<IJSONEditorRef>(null);
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

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (editorRef.current) {
        return editorRef.current.validate();
      }

      return Promise.resolve("");
    },
  }));

  return (
    <>
      <EuiSpacer size="m" />
      <EuiAccordion {...props.accordionProps} className="accordion-in-advanced-settings" id={accordionId}>
        <CustomFormRow {...(props.rowProps as EuiFormRowProps)}>
          {renderProps ? (
            (renderProps({
              value: propsRef.current.value || {},
              onChange: (val) => {
                if (propsRef.current?.onChange) {
                  propsRef.current?.onChange(val);
                }
              },
              ref: editorRef,
            }) as any)
          ) : (
            <JSONEditor {...editorProps} ref={editorRef} value={JSON.stringify(value, null, 2)} onChange={onChangeInRenderProps} />
          )}
        </CustomFormRow>
      </EuiAccordion>
    </>
  );
});
