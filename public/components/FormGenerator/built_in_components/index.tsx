import React, { forwardRef } from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch, EuiSelect, EuiCode } from "@elastic/eui";
import EuiToolTipWrapper, { IEuiToolTipWrapperProps } from "../../EuiToolTipWrapper";

type ComponentMapEnum = "Input" | "Number" | "Switch" | "Select" | "Text";

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
      <EuiFieldNumber inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Switch: EuiToolTipWrapper(
    forwardRef(({ value, onChange, ...others }, ref: React.Ref<any>) => (
      <div ref={ref}>
        <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
      </div>
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Text: (({ value }) => <EuiCode title={value || "-"}>{value || "-"}</EuiCode>) as React.ComponentType<IFieldComponentProps>,
  Select: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
      <EuiSelect inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
};

export default componentMap;
