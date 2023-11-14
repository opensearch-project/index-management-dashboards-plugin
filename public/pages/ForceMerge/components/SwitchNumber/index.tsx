/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
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
            label: "Automatic",
          },
          {
            id: "1",
            label: "Manually set number of segments",
          },
        ]}
        idSelected={id}
        onChange={(newId) => {
          setId(newId);
          if (newId === "0") {
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
