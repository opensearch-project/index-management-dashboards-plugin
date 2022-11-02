import React, { forwardRef, useMemo, useRef } from "react";
import { EuiAccordion, EuiAccordionProps, EuiForm, EuiFormProps, EuiFormRow, EuiFormRowProps, EuiSpacer } from "@elastic/eui";
import AllBuiltInComponents from "./built_in_components";
import Field, { InitOption, FieldOption } from "../../lib/field";
import { useImperativeHandle } from "react";
import JSONEditor from "../JSONEditor";
import { useEffect } from "react";

export interface IField {
  rowProps: Pick<EuiFormRowProps, "label" | "helpText">;
  name: string;
  type?: keyof typeof AllBuiltInComponents;
  component?: React.FC;
  options?: InitOption;
}

export interface IFormGeneratorProps {
  formFields: IField[];
  hasAdvancedSettings?: boolean;
  advancedSettingsRowProps?: IField["rowProps"];
  advancedSettingsAccordionProps?: EuiAccordionProps;
  fieldProps?: FieldOption;
  formProps?: EuiFormProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IFormGeneratorProps["value"], key?: string, value?: any) => void;
  onAdvancedChange?: (val: IFormGeneratorProps["value"]) => void;
}

export interface IFormGeneratorRef extends Field {}

export default forwardRef(function FormGenerator(props: IFormGeneratorProps, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields } = props;
  const propsRef = useRef(props);
  propsRef.current = props;
  const field = Field.useField({
    ...fieldProps,
    onChange(name, value) {
      propsRef.current.onChange &&
        propsRef.current.onChange(
          {
            ...field.getValues(),
            [name]: value,
          },
          name,
          value
        );
    },
  });
  const errorMessage: Record<string, string[]> = field.getErrors();
  useImperativeHandle(ref, () => field);
  const accordionId = useMemo(() => {
    return props.advancedSettingsAccordionProps?.id || `${Date.now()}-${Math.floor(Math.random() * 100)}`;
  }, [props.advancedSettingsAccordionProps?.id]);
  useEffect(() => {
    field.setValues(props.value);
  }, [props.value]);
  return (
    <EuiForm {...props.formProps}>
      {formFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <EuiFormRow {...item.rowProps} error={errorMessage[item.name]} isInvalid={!!errorMessage[item.name]}>
            <RenderComponent {...field.init(item.name, item.options)} />
          </EuiFormRow>
        );
      })}
      {props.hasAdvancedSettings ? (
        <>
          <EuiSpacer size="m" />
          <EuiAccordion {...props.advancedSettingsAccordionProps} id={accordionId}>
            <EuiSpacer size="m" />
            <EuiFormRow {...props.advancedSettingsRowProps}>
              <JSONEditor
                value={JSON.stringify(field.getValues(), null, 2)}
                onChange={(val: string) => {
                  const parsedValue = JSON.parse(val);
                  field.setValues(parsedValue);
                  props.onChange && props.onChange(parsedValue, undefined, parsedValue);
                  props.onAdvancedChange && props.onAdvancedChange(parsedValue);
                }}
              />
            </EuiFormRow>
          </EuiAccordion>
        </>
      ) : null}
    </EuiForm>
  );
});
