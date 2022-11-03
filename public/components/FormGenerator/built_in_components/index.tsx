import React from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";

const componentMap: Record<string, React.FC<{ onChange: (val: any) => void; value?: any }>> = {
  Input: ({ onChange, ...others }) => <EuiFieldText onChange={(e) => onChange(e.target.value)} {...others} />,
  Number: ({ onChange, value, ...others }) => <EuiFieldNumber onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />,
  Switch: ({ value, onChange, ...others }) => (
    <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
  ),
};

export default componentMap;
