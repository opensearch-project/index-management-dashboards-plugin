import React from "react";
import { EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";

export type IComponentMap = Record<string, React.FC<{ onChange: (val: any) => void; value?: any }>>;

const componentMap: IComponentMap = {
  Input: ({ onChange, ...others }) => <EuiFieldText onChange={(e) => onChange(e.target.value)} {...others} />,
  Number: ({ onChange, value, ...others }) => <EuiFieldNumber onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />,
  Switch: ({ value, onChange, ...others }) => (
    <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
  ),
};

export default componentMap;
