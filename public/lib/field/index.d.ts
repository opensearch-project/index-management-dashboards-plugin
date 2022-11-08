export type FieldOption = {
  /**
   * All component changes will arrive here [set value will not trigger this function]
   */
  onChange?: (name: string, value: any) => void;

  /**
   * Whether to translate the name in init(name) (get values ​​will convert the string with . into an object)
   * @default false
   */
  parseName?: boolean;

  /**
   * It is only recommended for PureComponent components to turn on this forced refresh function, which will bring performance problems (500 components as an example: it takes 700ms to render when it is turned on, and 400ms to render when it is turned off)
   * @default false
   */
  forceUpdate?: boolean;

  /**
   * When field.validate, scroll to the first error component, if it is an integer, it will be offset
   * @default true
   */
  scrollToFirstError?: boolean;

  /**
   * Automatically remove (remove) Unmout elements, if you want to keep the data, you can set it to false
   * @default true
   */
  autoUnmount?: boolean;

  /**
   * Whether or not to modify the data, the verification will be triggered automatically. If set to false, the verification can only be triggered by validate()
   * @default true
   */
  autoValidate?: boolean;

  /**
   * Initialization data
   */
  values?: {};

  /**
   * Scroll dom, window as default
   */
  scrollDom?: HTMLElement;
};

export type InitResult<T> = {
  id: string;
  value?: T;
  onChange(value: T): void;
};

export type InitResult2<T, T2> = {
  id: string;
  value?: T;
  onChange(value: T, extra: T2): void;
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
  validator?: (rule: Rule, value: string | number | object | boolean | Date | null, callback: (error?: string) => void) => void;

  /**
   * The name of the event that triggered the validation
   */
  trigger?: "onChange" | "onBlur" | string;
};

export type InitOption<T = any> = {
  /**
   * The attribute name of the component value, such as Checkbox is checked, Input is value
   */
  valueName?: string;

  /**
   * The initial value of the component (the component will only be read when it is rendered for the first time, and it will be invalid to modify this value later), similar to the default value
   */
  initValue?: T | T[];

  /**
   * The name of the event that triggered the data change
   * @default 'onChange'
   */
  trigger?: string | "onChange" | "onBlur";

  /**
   * Check rules
   */
  rules?: Rule[] | Rule;

  /**
   * Component custom events can be written here, others will be transparently transmitted (small package version ^0.3.0 support, large package ^0.7.0 support)
   */
  props?: any;

  /**
   * Customize the way to get `value` from the component, the parameter order is exactly the same as the component's onChange
   */
  getValueFormatter?: (eventArgs: any) => T;
  /**
   * Customize the conversion `value` to the data required by the component
   */
  setValueFormatter?: (value: T) => T;
};

export type ValidateResults = {
  errors: any[];
  values: any;
};

export class innerField {
  /**
   *
   * @param contextComp Pass in the this of the calling class
   * @param options 一些事件配置
   */
  constructor(contextComp: any, options?: FieldOption);

  /**
   *
   * @param contextComp Pass in the this of the calling class
   * @param options 一些事件配置
   */
  static create(contextComp: any, options?: FieldOption): Field;

  /**
   *
   *
   * @param useState React compatible `useState` function
   * @returns Function
   */
  static getUseField<T>(config: { useState: Function; useMemo: Function }): (options?: FieldOption) => Field;

  /**
   * Initialize each component
   */
  init<T>(name: string, option?: InitOption, props?: {}): InitResult<T>;

  /**
   * Initialize each component
   */
  init<T, T2>(name: string, option?: InitOption, props?: {}): InitResult2<T, T2>;

  /**
   *
   * Reset the value of a set of input controls, clear the checksum
   * @param names reset field name
   */
  reset(names?: string[] | string): void;
  /**
   *
   * Reset the value of a group of input controls to the default value, equivalent to reset(name, true)
   * @param names reset field name
   */
  resetToDefault(names?: string[] | string): void;

  /**
   * Delete the data of a certain control or a group of controls, and the related validate/value will be cleared after deletion
   * @param name Field Name
   */
  remove(name: string | string[]): void;

  /**
   * check
   * @param callback
   */
  validateCallback(callback?: (errors: any[], values: object) => void): void;

  /**
   * check
   * @param names
   * @param callback
   */
  validateCallback(names?: string[] | string, callback?: (errors: any[], values: object) => void): void;

  /**
   * check
   * @param names
   * @param callback
   */
  validatePromise(names?: string[] | string, callback?: (errors: any[], values: object) => Promise<any>): Promise<ValidateResults>;

  /**
   * check
   * @param names
   */
  validatePromise(names?: string[] | string): Promise<ValidateResults>;

  /**
   * Check and get a set of input field values ​​and error objects
   */
  /**
   * 	Get the keys of all components
   */
  getNames(): string[];

  /**
   * 	Get the value of a single input control
   * @param field name
   */
  getValue<T>(name: string): T;

  /**
   * Get the values ​​of a set of input controls, if no parameters are passed in, get the values ​​of all components
   * @param names
   */
  getValues<T>(names?: string[]): T;

  /**
   * Set the value of a single input control (will trigger render, please follow the timing of react)
   */
  setValue<T>(name: string, value: T): void;

  /**
   * Set the value of a set of input controls (will trigger render, please follow the timing of react)
   */
  setValues(obj: any): void;

  /**
   * Set the value of a set of input controls (will trigger render, please follow the timing of react)
   */
  setValues<T>(obj: T): void;

  /**
   * Judging verification status
   */
  getState(name: string): "error" | "success" | "validating";

  /**
   * Get the Error of a single input control
   */
  getError(name: string): null | string[];

  /**
   * Get the Error for a set of input controls
   * @param names field name
   */
  getErrors(names?: string[]): any;

  /**
   * Sets the Error for a single input control
   * @param name
   * @param errors
   */
  setError(name: string, errors?: null | string[] | string): void;

  /**
   * Sets the Error for a set of input controls
   */
  setErrors(obj: any): void;

  addArrayValue<T>(key: string, index: number, ...args: T[]): void;
  /**
   *
   * @param key variable name
   * @param index number of the array
   * @param howmany delete several, default is 1
   */
  deleteArrayValue(key: string, index: number, howmany?: number): void;
}

export default class Field extends innerField {
  /**
   *
   * @param contextComp Pass in the this of the calling class
   * @param options some event configuration
   */
  constructor(contextComp: any, options?: FieldOption);

  /**
   * @param callback
   */
  validate(callback?: (errors: object[], values: object) => void): void;

  /**
   * @param names
   * @param callback
   */
  validate(names?: string[] | string, callback?: (errors: object[], values: object) => void): void;

  /**
   * React hooks style uses Field
   * @param options
   */
  static useField(options?: FieldOption): Field;
}
