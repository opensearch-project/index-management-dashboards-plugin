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

interface IFormGeneratorProps<T> {
  formFields: IField[];
  hasAdvancedSettings?: boolean;
  fieldProps?: FieldOption;
  value?: T;
  onChange?: (val: IFormGeneratorProps<T>["value"]) => void;
}

interface IFormGeneratorRef extends Field {}

export default forwardRef(function FormGenerator<T>(props: IFormGeneratorProps<T>, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields } = props;
  const field = Field.useField(fieldProps);
  const errorMessage = field.getErrors();
  useImperativeHandle(ref, () => field);
  return (
    <EuiForm>
      {formFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <EuiFormRow error={errorMessage[item.name]} isInvalid={!!errorMessage[item.name]} label={item.label}>
            <RenderComponent {...item.options?.props} {...field.init(item.name, item.options)} />
          </EuiFormRow>
        );
      })}
    </EuiForm>
  );
});
