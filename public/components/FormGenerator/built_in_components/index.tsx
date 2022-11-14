import React, { forwardRef } from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";
import EuiToolTipWrapper, { IEuiToolTipWrapperProps } from "../../EuiToolTipWrapper";

type ComponentMapEnum = "Input" | "Number" | "Switch";

export interface IFieldComponentProps extends IEuiToolTipWrapperProps {
  onChange: (val: IFieldComponentProps["value"]) => void;
  value?: any;
  [key: string]: any;
}

const componentMap: Record<ComponentMapEnum, React.ComponentType<IFieldComponentProps>> = {
  Input: EuiToolTipWrapper(
    forwardRef(({ onChange, value, disabledReason, disabled, ...others }, ref: React.Ref<HTMLInputElement>) => (
      <EuiFieldText inputRef={ref} value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} {...others} />
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
};

export default componentMap;
