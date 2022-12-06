import React, { useEffect, useRef, useState } from "react";
import { Rule, FieldOption, FieldInstance, InitOption, InitResult, ValidateFunction } from "./interfaces";
import buildInRules from "./rules";

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
  const setValue: FieldInstance["setValue"] = (name, value) => {
    setValues({
      ...values.current,
      [name]: value,
    });
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
      [name]: error,
    });
  };
  const validateField = async (name: string) => {
    const fieldOptions = fieldsMapRef.current[name];
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
        } else if (item.min || item.max) {
          validateFunction = buildInRules.size;
        } else if (item.pattern) {
          validateFunction = buildInRules.pattern;
        }

        let errorInfo = null;

        try {
          const result = validateFunction(
            {
              ...item,
              field: name,
            },
            values.current[name]
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
    setErrors({
      ...errors,
      [name]: fieldErrors.length ? fieldErrors : null,
    });

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
      fieldsMapRef.current[initOptions.name] = initOptions;
      const payload: InitResult<any> = {
        ...initOptions.props,
        value: values.current[initOptions.name],
        onChange: (val) => {
          setValue(initOptions.name, val);
          validateField(initOptions.name);
          options?.onChange && options?.onChange(initOptions.name, val);
        },
      };
      if (options?.unmountComponent) {
        if (!refCallbacks.current[initOptions.name]) {
          refCallbacks.current[initOptions.name] = (ref: any) => {
            if (!ref) {
              delete fieldsMapRef.current[initOptions.name];
              delete refCallbacks.current[initOptions.name];
            }
          };
        }
        payload.ref = refCallbacks.current[initOptions.name] as React.RefCallback<any>;
      }
      return payload;
    },
    setValue,
    setValues,
    getValue: (name) => values.current[name],
    getValues: () => values.current,
    getError: (name) => errors.current[name],
    getErrors: () => errors.current,
    validatePromise: async () => {
      const result = await Promise.all(
        Object.keys(fieldsMapRef.current).map((name) => {
          return validateField(name).then((res) => {
            if (res.length) {
              return {
                [name]: res,
              };
            }

            return null;
          });
        })
      );
      const resultArray = result.filter((item) => item) as Record<string, string[]>[];
      return {
        errors: resultArray.length
          ? resultArray.reduce((total, current) => ({ ...total, ...current }), {} as Record<string, string[]>)
          : null,
        values: values.current,
      };
    },
    setError,
    setErrors,
    resetValues,
  };
}

export * from "./interfaces";
