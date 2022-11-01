import React, { forwardRef } from "react";
import { EuiForm, EuiFormRow } from "@elastic/eui";
import AllBuiltInComponents from "./built_in_components";
import Field, { InitOption, FieldOption } from "../../lib/field";
import { useImperativeHandle } from "react";

interface IField {
  label: string;
  name: string;
  type?: keyof typeof AllBuiltInComponents;
  component?: React.FC;
  options?: InitOption;
}

export interface IFormGeneratorProps {
  formFields: IField[];
  hasAdvancedSettings?: boolean;
  fieldProps?: FieldOption;
  value?: any;
  onChange?: (val: IFormGeneratorProps["value"]) => void;
}

export interface IFormGeneratorRef extends Field {}

export default forwardRef(function FormGenerator(props: IFormGeneratorProps, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields } = props;
  const field = Field.useField(fieldProps);
  const errorMessage: Record<string, string[]> = field.getErrors();
  useImperativeHandle(ref, () => field);
  return (
    <EuiForm>
      {formFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <EuiFormRow key={item.name} error={errorMessage[item.name]} isInvalid={!!errorMessage[item.name]} label={item.label}>
            <>
              <RenderComponent {...item.options?.props} {...field.init(item.name, item.options)} />
            </>
          </EuiFormRow>
        );
      })}
    </EuiForm>
  );
});
