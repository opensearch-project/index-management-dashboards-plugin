import React, { useEffect, useRef, useState } from "react";
import { set, get, unset } from "lodash";
import { Rule, FieldOption, FieldInstance, InitOption, InitResult, ValidateFunction, FieldName } from "./interfaces";
import buildInRules from "./rules";

export function transformNameToString(name: FieldName) {
  if (Array.isArray(name)) {
    return name.join(".");
  } else {
    return name;
  }
}

export default function useField<T>(options?: FieldOption): FieldInstance {
  const [, setValuesState] = useState((options?.values || {}) as Record<string, any>);
  const [, setErrorsState] = useState({} as Record<string, null | string[]>);
  const destroyRef = useRef<boolean>(false);
  const values = useRef<Record<string, any>>(options?.values || {});
  const errors = useRef<Record<string, null | string[]>>({});
  const fieldsMapRef = useRef<Record<string, InitOption>>({});
  const setValues = (obj: Record<string, any>) => {
    if (destroyRef.current) {
      return;
    }
    values.current = {
      ...values.current,
      ...obj,
    };
    setValuesState(values.current);
  };
  const resetValues = (obj: Record<string, any>) => {
    if (destroyRef.current) {
      return;
    }
    values.current = obj;
    setValuesState(values.current);
  };
  const setValue: FieldInstance["setValue"] = (name: FieldName, value) => {
    const payload = { ...values.current };
    if (!Array.isArray(name)) {
      name = [name];
    }
    set(payload, name, value);
    setValues(payload);
  };
  const setErrors: FieldInstance["setErrors"] = (errs) => {
    if (destroyRef.current) {
      return;
    }
    errors.current = {
      ...errors.current,
      ...errs,
    };
    setErrorsState(errors.current);
  };
  const setError: FieldInstance["setError"] = (name, error) => {
    setErrors({
      ...errors.current,
      [transformNameToString(name)]: error,
    });
  };
  const validateField = async (name: FieldName) => {
    const fieldOptions = fieldsMapRef.current[transformNameToString(name)];
    const rules: Rule[] = fieldOptions.rules || [];
    const result = await Promise.all(
      rules.map(async (item) => {
        let validateFunction: ValidateFunction = () => undefined;
        if (item.validator) {
          validateFunction = item.validator;
        } else if (item.required) {
          validateFunction = buildInRules.required;
        } else if (item.format) {
          validateFunction = buildInRules.format;
        } else if (typeof item.min === "number" || typeof item.max === "number") {
          validateFunction = buildInRules.size;
        } else if (item.pattern) {
          validateFunction = buildInRules.pattern;
        }

        let errorInfo = null;
        try {
          const result = validateFunction(
            {
              ...item,
              field: transformNameToString(name),
            },
            get(values.current, name)
          );
          if (result && (result as Promise<string>).then) {
            await result;
          } else {
            errorInfo = result;
          }
        } catch (e) {
          errorInfo = e || item.message;
        }

        return errorInfo;
      })
    );
    const fieldErrors = result.filter((item) => item) as string[];

    return fieldErrors;
  };
  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const refCallbacks = useRef<Record<string, React.Ref<any>>>({});
  return {
    registerField: (initOptions: InitOption): InitResult<any> => {
      const fieldName = transformNameToString(initOptions.name);
      fieldsMapRef.current[fieldName] = initOptions;
      const payload: InitResult<any> = {
        ...initOptions.props,
        value: get(values.current, initOptions.name),
        onChange: async (val) => {
          setValue(initOptions.name, val);
          options?.onChange && options?.onChange(initOptions.name, val);
          const validateErros = await validateField(initOptions.name);
          setErrors({
            [fieldName]: validateErros.length ? validateErros : null,
          });
        },
      };
      if (options?.unmountComponent) {
        if (!refCallbacks.current[fieldName]) {
          refCallbacks.current[fieldName] = (ref: any) => {
            if (!ref) {
              delete fieldsMapRef.current[fieldName];
              delete refCallbacks.current[fieldName];
            }
          };
        }
        payload.ref = refCallbacks.current[fieldName] as React.RefCallback<any>;
      }
      return payload;
    },
    setValue,
    setValues,
    getValue: (name) => get(values.current, name),
    getValues: () => values.current,
    getError: (name) => errors.current[transformNameToString(name)],
    getErrors: () => errors.current,
    validatePromise: async () => {
      const result = await Promise.all(
        Object.values(fieldsMapRef.current).map(({ name }) => {
          return validateField(name).then((res) => {
            if (res.length) {
              return {
                [transformNameToString(name)]: res,
              };
            }

            return null;
          });
        })
      );
      const resultArray = result.filter((item) => item) as Record<string, string[]>[];
      const resultPayload = resultArray.reduce((total, current) => ({ ...total, ...current }), {} as Record<string, string[]>);
      setErrors(resultPayload);
      return {
        errors: resultArray.length ? resultPayload : null,
        values: values.current,
      };
    },
    setError,
    setErrors,
    resetValues,
    deleteValue: (key) => {
      const newValues = { ...values.current };
      unset(newValues, key);
      resetValues(newValues);
    },
  };
}

export * from "./interfaces";
