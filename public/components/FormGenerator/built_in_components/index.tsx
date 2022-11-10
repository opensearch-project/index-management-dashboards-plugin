import React, { forwardRef } from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";

type ComponentMapEnum = "Input" | "Number" | "Switch";

const componentMap: Record<ComponentMapEnum, React.FC<{ onChange: (val: any) => void; value?: any }>> = {
  Input: forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
    <EuiFieldText inputRef={ref} value={value || ""} onChange={(e) => onChange(e.target.value)} {...others} />
  )),
  Number: forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
    <EuiFieldNumber inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />
  )),
  Switch: forwardRef(({ value, onChange, ...others }, ref: React.Ref<any>) => (
    <div ref={ref}>
      <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
    </div>
  )),
};

export default componentMap;
