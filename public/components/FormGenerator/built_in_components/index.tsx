import React, { forwardRef } from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch, EuiSelect, EuiCode, EuiComboBox, EuiText } from "@elastic/eui";
import EuiToolTipWrapper, { IEuiToolTipWrapperProps } from "../../EuiToolTipWrapper";

export type ComponentMapEnum = "Input" | "Number" | "Switch" | "Select" | "Text" | "ComboBoxSingle";

export interface IFieldComponentProps extends IEuiToolTipWrapperProps {
  onChange: (val: IFieldComponentProps["value"]) => void;
  value?: any;
  [key: string]: any;
}

const componentMap: Record<ComponentMapEnum, React.ComponentType<IFieldComponentProps>> = {
  Input: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<HTMLInputElement>) => (
      <EuiFieldText inputRef={ref} value={value || ""} onChange={(e) => onChange(e.target.value)} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Number: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<HTMLInputElement>) => (
      <EuiFieldNumber inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value === undefined ? "" : value} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Switch: EuiToolTipWrapper(
    forwardRef(({ value, onChange, ...others }, ref: React.Ref<any>) => (
      <div ref={ref}>
        <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
      </div>
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Text: forwardRef(({ value }, ref: React.Ref<any>) => (
    <div ref={ref}>
      <EuiText title={value || "-"}>{value || "-"}</EuiText>
    </div>
  )) as React.ComponentType<IFieldComponentProps>,
  Select: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
      <EuiSelect inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  ComboBoxSingle: EuiToolTipWrapper(
    forwardRef(({ onChange, value, options, ...others }, ref: React.Ref<any>) => {
      return (
        <EuiComboBox
          {...others}
          options={options}
          onCreateOption={(searchValue) => {
            const findItem = options.find((item: { label: string }) => item.label === searchValue);
            if (findItem) {
              onChange(searchValue);
            }
          }}
          singleSelection={{ asPlainText: true }}
          ref={ref}
          onChange={(selectedOptions) => {
            if (selectedOptions && selectedOptions[0]) {
              onChange(selectedOptions[0].label);
            } else {
              onChange(undefined);
            }
          }}
          selectedOptions={[value].filter((item) => item !== undefined).map((label) => ({ label }))}
        />
      );
    })
  ) as React.ComponentType<IFieldComponentProps>,
};

export default componentMap;
