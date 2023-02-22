/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";

// if it's a string[], the value will become nested.
// registerField({ name: ['a', 'b', 'c.d'] }) => { a: { b: { c,d: '' } } }
export type FieldName = string | string[];

export type FieldOption = {
  /**
   * All component changes will arrive here [set value will not trigger this function]
   */
  onChange?: (name: FieldName, value?: any) => void;

  /**
   * Initialization data
   */
  values?: {};

  /**
   * OriginalValues
   */
  originalValues?: {};

  unmountComponent?: boolean;
};

export type ValidateResults = {
  errors: Record<string, string[]> | null;
  values: any;
};

export type InitResult<T> = {
  value?: T;
  onChange(value: T): void;
  ref?: React.RefCallback<any>;
};

export type Rule = {
  /**
   * cannot be empty (cannot be used with pattern)
   * @default true
   */
  required?: boolean;

  /**
   * error message
   */
  message?: string;

  /**
   * Check Regular Expression
   */
  pattern?: RegExp;
  /**
   * Minimum string length /minimum number of arrays
   */
  minLength?: number;
  /**
   * Maximum string length /maximum number of arrays
   */
  maxLength?: number;

  /**
   * String exact length /array exact number
   */
  length?: number;

  /**
   * minimum
   */
  min?: number;

  /**
   * maximum value
   */
  max?: number;
  /**
   * Summary of common patterns
   */
  format?: "url" | "email" | "tel" | "number";

  /**
   * Custom verification, (don't forget to execute callback() when the verification is successful, otherwise the verification will not return)
   */
  validator?: (rule: Rule, value: string | number | object | boolean | Date | null | any) => string | Promise<string>;

  /**
   * The name of the event that triggered the validation
   */
  trigger?: "onChange" | "onBlur" | string;
};

export type InitOption = {
  /**
   * The name of the field
   */
  name: FieldName;

  /**
   * The name of the event that triggered the data change
   * @default 'onChange'
   */
  trigger?: string | "onChange" | "onBlur";

  /**
   * Check rules
   */
  rules?: Rule[];

  /**
   * Component custom events can be written here, others will be transparently transmitted (small package version ^0.3.0 support, large package ^0.7.0 support)
   */
  props?: any;
};

export type FieldInstance = {
  /**
   * Initialize each component
   */
  registerField(option?: InitOption): InitResult<any>;

  /**
   * check
   * @param name
   */
  validatePromise(name?: FieldName): Promise<ValidateResults>;

  /**
   * 	Get the value of a single input control
   * @param field name
   */
  getValue(name: FieldName): any;

  /**
   * Get the values ​​of a set of input controls, if no parameters are passed in, get the values ​​of all components
   * @param names
   */
  getValues(): any;

  /**
   * Get the values ​​of a set of input controls, if no parameters are passed in, get the values ​​of all components
   * @param names
   */
  getOriginalValues(): any;

  /**
   * Set the value of a single input control (will trigger render, please follow the timing of react)
   */
  setValue(name: FieldName, value: any): void;

  /**
   * Set the value of a set of input controls (will trigger render, please follow the timing of react)
   */
  setValues(obj: any): void;

  /**
   *
   */
  setOriginalValues(obj: any): void;

  /**
   * Reset values
   */
  resetValues(obj: any): void;

  /**
   * Delete value
   */
  deleteValue(key: FieldName): void;

  /**
   * Get the Error of a single input control
   */
  getError(name: FieldName): null | string[];

  /**
   * Get the Error for a set of input controls
   * @param names field name
   */
  getErrors(): any;

  /**
   * Sets the Error for a single input control
   * @param name
   * @param errors
   */
  setError(name: FieldName, errors: null | string[]): void;

  /**
   * Sets the Error for a set of input controls
   */
  setErrors(obj: any): void;

  /**
   * Get difference between originalValues & currentValues
   */
  computeDifference(): number;
};

export type ValidateFunction = (
  rule: Rule & { field: string; aliasName?: string },
  value: string | number | object | boolean | Date
) => string | Promise<string> | undefined;
