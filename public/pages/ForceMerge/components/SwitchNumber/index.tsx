import React, { useState } from "react";
import { EuiRadioGroup, EuiSpacer } from "@elastic/eui";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";

interface SwitchNumberProps {
  value?: number;
  onChange: (val: SwitchNumberProps["value"]) => void;
}

export default function SwitchNumber(props: SwitchNumberProps) {
  const [id, setId] = useState(props.value && props.value > 0 ? "1" : "0");
  return (
    <>
      <EuiRadioGroup
        options={[
          {
            id: "0",
            label: "Automatically",
          },
          {
            id: "1",
            label: "Manually set",
          },
        ]}
        idSelected={id}
        onChange={(id) => {
          setId(id);
          if (id === "0") {
            props.onChange(undefined);
          } else {
            props.onChange(1);
          }
        }}
      />
      {id === "1" ? (
        <>
          <EuiSpacer size="s" />
          <CustomFormRow helpText="Specify the number of segments to merge to">
            <AllBuiltInComponents.Number {...props} />
          </CustomFormRow>
        </>
      ) : null}
    </>
  );
}
