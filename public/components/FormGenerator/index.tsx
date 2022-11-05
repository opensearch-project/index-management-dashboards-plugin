import React, { forwardRef, useRef } from "react";
import { EuiForm, EuiFormProps, EuiFormRow, EuiFormRowProps } from "@elastic/eui";
import AllBuiltInComponents, { IComponentMap } from "./built_in_components";
import Field, { InitOption, FieldOption } from "../../lib/field";
import { useImperativeHandle } from "react";
import AdvancedSettings, { IAdvancedSettingsProps } from "../AdvancedSettings";
import { useEffect } from "react";

export interface IField {
  rowProps: EuiFormRowProps;
  name: string;
  type?: keyof typeof AllBuiltInComponents;
  component?: IComponentMap[string];
  options?: InitOption;
}

export interface IFormGeneratorProps {
  formFields: IField[];
  hasAdvancedSettings?: boolean;
  advancedSettingsProps?: IAdvancedSettingsProps;
  fieldProps?: FieldOption;
  formProps?: EuiFormProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IFormGeneratorProps["value"], key?: string, value?: any) => void;
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
  useEffect(() => {
    field.setValues(props.value);
  }, [props.value]);
  return (
    <EuiForm {...props.formProps}>
      {formFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <EuiFormRow
            data-test-subj={`form-name-${item.name}`}
            key={item.name}
            {...item.rowProps}
            error={errorMessage[item.name]}
            isInvalid={!!errorMessage[item.name]}
          >
            <RenderComponent {...field.init(item.name, item.options)} />
          </EuiFormRow>
        );
      })}
      {props.hasAdvancedSettings ? (
        <AdvancedSettings
          {...props.advancedSettingsProps}
          rowProps={{
            "data-test-subj": "form-name-advanced-settings",
            ...props.advancedSettingsProps?.rowProps,
          }}
          value={field.getValues()}
          onChange={(val) => {
            field.setValues(val);
            props.onChange && props.onChange(val, undefined, val);
          }}
        />
      ) : null}
    </EuiForm>
  );
});
