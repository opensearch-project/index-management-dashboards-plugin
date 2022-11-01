import React from "react";
import { EuiFieldText } from "@elastic/eui";

const componentMap: Record<string, React.FC<{ onChange: (val: any) => void }>> = {
  Input: ({ onChange, ...others }) => <EuiFieldText onChange={(e) => onChange(e.target.value)} {...others} />,
};

export default componentMap;
