import React, { forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from "react";
import { EuiForm, EuiFormProps, EuiFormRowProps } from "@elastic/eui";
import AllBuiltInComponents from "./built_in_components";
// import Field, { InitOption, FieldOption, Rule } from "../../lib/field";
import useField, { InitOption, FieldOption, Rule, FieldInstance } from "../../lib/field";
import AdvancedSettings, { IAdvancedSettingsProps } from "../AdvancedSettings";
import CustomFormRow from "../CustomFormRow";

type ParametersOfValidator = Parameters<Required<Rule>["validator"]>;
interface IRule extends Omit<Rule, "validator"> {
  validator?: (rule: ParametersOfValidator[0], value: ParametersOfValidator[1], values: Record<string, any>) => Promise<string | void>;
}

interface IInitOption extends Omit<InitOption, "rules"> {
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
  options?: Omit<IInitOption, "name">;
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

export interface IFormGeneratorRef extends FieldInstance {}

export default forwardRef(function FormGenerator(props: IFormGeneratorProps, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields, advancedSettingsProps } = props;
  const { blockedNameList } = advancedSettingsProps || {};
  const propsRef = useRef(props);
  propsRef.current = props;
  const field = useField({
    ...fieldProps,
    onChange(name: string, value: any) {
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
            validator: (rule: Rule, value: any) => ruleItem.validator?.apply(field, [rule, value, field.getValues()] as any) as any,
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
            <RenderComponent
              {...field.registerField({
                ...(item.options as InitOption),
                name: item.name,
              })}
            />
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
              ...field.getValues(),
              ...val,
            };
            props.onChange && props.onChange(totalValue, undefined, val);
          }}
        />
      ) : null}
    </EuiForm>
  );
});
