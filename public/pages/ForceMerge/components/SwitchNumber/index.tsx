/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { EuiCompressedRadioGroup, EuiSpacer } from "@elastic/eui";
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
      <EuiCompressedRadioGroup
        options={[
          {
            id: "0",
            label: "Automatic",
          },
          {
            id: "1",
            label: "Manually set number of segments",
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
          <CustomFormRow
            label="Number of segments"
            helpText="Specify the number of segments to merge to. To fully merge indexes, set the number of segments to 1."
          >
            <AllBuiltInComponents.Number {...props} placeholder="Specify a number" />
          </CustomFormRow>
        </>
      ) : null}
    </>
  );
}
