import React, { forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from "react";
import { EuiForm, EuiFormProps, EuiSpacer } from "@elastic/eui";
import { isEqual, omit, pick } from "lodash";
import AllBuiltInComponents, { IFieldComponentProps } from "./built_in_components";
import useField, { InitOption, FieldOption, Rule, FieldInstance, FieldName, transformNameToString } from "../../lib/field";
import AdvancedSettings, { IAdvancedSettingsProps, IAdvancedSettingsRef } from "../AdvancedSettings";
import CustomFormRow, { CustomFormRowProps } from "../CustomFormRow";

export * from "./built_in_components";

type ParametersOfValidator = Parameters<Required<Rule>["validator"]>;
interface IRule extends Omit<Rule, "validator"> {
  validator?: (rule: ParametersOfValidator[0], value: ParametersOfValidator[1], values: Record<string, any>) => Promise<string | void>;
}

interface IInitOption extends Omit<InitOption, "rules"> {
  rules?: IRule[];
}

interface IFormGeneratorAdvancedSettings<T> extends IAdvancedSettingsProps<T> {
  blockedNameList?: string[];
}

export interface IField {
  rowProps: Pick<CustomFormRowProps, "label" | "helpText" | "fullWidth" | "position" | "direction" | "style">;
  name: FieldName;
  type?: keyof typeof AllBuiltInComponents;
  component?: React.ComponentType<IFieldComponentProps>;
  options?: Omit<IInitOption, "name">;
}

export interface IFormGeneratorProps<T> {
  formFields: IField[];
  resetValuesWhenPropsValueChange?: boolean;
  hasAdvancedSettings?: boolean;
  advancedSettingsProps?: IFormGeneratorAdvancedSettings<T>;
  fieldProps?: FieldOption;
  formProps?: EuiFormProps;
  value?: T;
  onChange?: (totalValue: IFormGeneratorProps<T>["value"], key?: FieldName, value?: any) => void;
}

export interface IFormGeneratorRef extends FieldInstance {}

export { AllBuiltInComponents };

function FormGenerator<T>(props: IFormGeneratorProps<T>, ref: React.Ref<IFormGeneratorRef>) {
  const { fieldProps, formFields, advancedSettingsProps } = props;
  const { blockedNameList } = advancedSettingsProps || {};
  const propsRef = useRef(props);
  const advancedRef = useRef<IAdvancedSettingsRef>(null);
  propsRef.current = props;
  const field = useField({
    ...fieldProps,
    onChange(name: FieldName, value: any) {
      propsRef.current.onChange && propsRef.current.onChange({ ...field.getValues() }, name, value);
    },
  });
  const errorMessage: Record<string, string[]> = field.getErrors();
  useImperativeHandle(ref, () => ({
    ...field,
    validatePromise: async () => {
      const result = await field.validatePromise();
      if (advancedRef.current?.validate) {
        try {
          await advancedRef.current.validate();
        } catch (e: any) {
          result.errors = result.errors || {};
          result.errors._advancedSettings = [e];
        }
      }

      return result;
    },
  }));
  useEffect(() => {
    if (!isEqual(field.getValues(), props.value)) {
      if (propsRef.current.resetValuesWhenPropsValueChange) {
        field.resetValues(props.value);
      } else {
        field.setValues(props.value);
      }
    }
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

  const finalValue: T = useMemo(() => {
    const value = field.getValues();
    if (!blockedNameList) {
      return field.getValues();
    }

    return omit(value, blockedNameList);
  }, [field.getValues(), blockedNameList]);

  return (
    <EuiForm {...props.formProps}>
      {formattedFormFields.map((item) => {
        const RenderComponent = item.type ? AllBuiltInComponents[item.type] : item.component || (() => null);
        return (
          <CustomFormRow
            data-test-subj={`form-name-${item.name}`}
            key={transformNameToString(item.name)}
            {...item.rowProps}
            error={errorMessage[transformNameToString(item.name)]}
            isInvalid={!!errorMessage[transformNameToString(item.name)]}
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
        <>
          <EuiSpacer size="m" />
          <AdvancedSettings
            {...props.advancedSettingsProps}
            ref={advancedRef}
            rowProps={{
              "data-test-subj": "formNameAdvancedSettings",
              ...props.advancedSettingsProps?.rowProps,
            }}
            value={finalValue}
            onChange={(val) => {
              const totalValue = field.getValues();
              const editorValue = omit(val || {}, blockedNameList || []);
              const resetValue = {
                ...editorValue,
                ...pick(totalValue, blockedNameList || []),
              };
              // update form field value to rerender
              field.resetValues(resetValue);

              // reset editors value
              advancedRef.current?.setValue(editorValue);

              // only validate when value changed
              if (!isEqual(val, finalValue)) {
                field.validatePromise();
              }
              propsRef.current.onChange && propsRef.current.onChange(field.getValues(), undefined, editorValue);
            }}
          />
        </>
      ) : null}
    </EuiForm>
  );
}

export default forwardRef(FormGenerator) as <T>(
  props: IFormGeneratorProps<T> & { ref?: React.Ref<IFormGeneratorRef> }
) => ReturnType<typeof FormGenerator>;
