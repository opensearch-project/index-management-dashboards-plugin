import React, { forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from "react";
import { EuiForm, EuiFormProps, EuiFormRowProps } from "@elastic/eui";
import AllBuiltInComponents from "./built_in_components";
import Field, { InitOption, FieldOption, Rule } from "../../lib/field";
import AdvancedSettings, { IAdvancedSettingsProps } from "../AdvancedSettings";
import CustomFormRow from "../CustomFormRow";

type ParametersOfValidator = Parameters<Required<Rule>["validator"]>;
interface IRule extends Omit<Rule, "validator"> {
  validator?: (
    rule: ParametersOfValidator[0],
    value: ParametersOfValidator[1],
    callback: ParametersOfValidator[2],
    values: Record<string, any>
  ) => ReturnType<Required<Rule>["validator"]>;
}

interface IInitOption extends InitOption {
  rules?: IRule[];
}

interface IFormGeneratorAdvancedSettings extends IAdvancedSettingsProps {
  blockedNameList?: string[];
}

export interface IField {
  rowProps: Pick<EuiFormRowProps, "label" | "helpText">;
  name: string;
  type?: keyof typeof AllBuiltInComponents;
  component?: typeof AllBuiltInComponents["Input"];
  options?: IInitOption;
}

export interface IFormGeneratorProps {
  formFields: IField[];
  hasAdvancedSettings?: boolean;
  advancedSettingsProps?: IFormGeneratorAdvancedSettings;
  fieldProps?: FieldOption;
  formProps?: EuiFormProps;
  value?: Record<string, any>;
  onChange?: (totalValue: IFormGeneratorProps["value"], key?: string, value?: any) => void;
}

export interface IFormGeneratorRef extends Field {}

export default forwardRef(function FormGenerator(props: IFormGeneratorProps, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields, advancedSettingsProps } = props;
  const { blockedNameList } = advancedSettingsProps || {};
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
  const formattedFormFields = useMemo(() => {
    return formFields.map((item) => {
      const { rules } = item.options || {};
      let arrayedRules: IRule[];
      if (rules) {
        arrayedRules = rules;
      } else {
        arrayedRules = [];
      }

      const formattedRules = arrayedRules.map((ruleItem) => {
        if (ruleItem.validator) {
          return {
            ...ruleItem,
            validator: ((rule, value, callback) =>
              ruleItem.validator?.apply(field, [rule, value, callback, field.getValues()] as any)) as Rule["validator"],
          };
        }

        return ruleItem;
      });

      return {
        ...item,
        options: {
          ...item.options,
          rules: formattedRules,
        },
      };
    });
  }, [formFields, field]);

  const finalValue: Record<string, any> = useMemo(() => {
    const value = field.getValues();
    if (!blockedNameList) {
      return field.getValues();
    }

    return Object.entries(value || {}).reduce((total, [key, value]) => {
      if (blockedNameList.includes(key)) {
        return total;
      }

      return {
        ...total,
        [key]: value,
      };
    }, {});
  }, [field.getValues(), blockedNameList]);

  return (
    <EuiForm {...props.formProps}>
      {formattedFormFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <CustomFormRow
            data-test-subj={`form-name-${item.name}`}
            key={item.name}
            {...item.rowProps}
            error={errorMessage[item.name]}
            isInvalid={!!errorMessage[item.name]}
          >
            <RenderComponent {...field.init(item.name, item.options)} />
          </CustomFormRow>
        );
      })}
      {props.hasAdvancedSettings ? (
        <AdvancedSettings
          {...props.advancedSettingsProps}
          rowProps={{
            "data-test-subj": "form-name-advanced-settings",
            ...props.advancedSettingsProps?.rowProps,
          }}
          value={finalValue}
          onChange={(val) => {
            field.setValues(val);
            const totalValue = {
              ...field.getValues<any>(),
              ...val,
            };
            props.onChange && props.onChange(totalValue, undefined, val);
          }}
        />
      ) : null}
    </EuiForm>
  );
});
