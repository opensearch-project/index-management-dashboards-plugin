import React from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";

type ComponentMapEnum = "Input" | "Number" | "Switch";

const componentMap: Record<ComponentMapEnum, React.FC<{ onChange: (val: any) => void; value?: any }>> = {
  Input: ({ onChange, value, ...others }) => <EuiFieldText value={value || ""} onChange={(e) => onChange(e.target.value)} {...others} />,
  Number: ({ onChange, value, ...others }) => <EuiFieldNumber onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />,
  Switch: ({ value, onChange, ...others }) => (
    <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
  ),
};

export default componentMap;
