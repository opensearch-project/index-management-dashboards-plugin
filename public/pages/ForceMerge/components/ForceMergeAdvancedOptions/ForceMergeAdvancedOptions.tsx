/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiSpacer } from "@elastic/eui";
import React from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { FieldInstance } from "../../../../lib/field";
import SwitchNumber from "../SwitchNumber";

export interface ForceMergeOptionsProps {
  field: FieldInstance;
}

const ForceMergeAdvancedOptions = (props: ForceMergeOptionsProps) => {
  const { field } = props;

  return (
    <div style={{ padding: "10px 0px" }}>
      <CustomFormRow label="Segment indexes" helpText="Define how many segments to merge to.">
        <SwitchNumber
          {...field.registerField({
            name: "max_num_segments",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow label="Flush indexes" helpText="Opensearch will perform a flush on the indexes after the force merge.">
        <AllBuiltInComponents.CheckBox
          {...field.registerField({
            name: "flush",
          })}
          label="Flush indexes"
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow
        label="Expunge deleted documents"
        fullWidth
        helpText="Expunge all segments containing more than 10% of deleted documents. The percentage is configurable with the setting index.merge.policy.expunge_deletes_allowed."
      >
        <AllBuiltInComponents.CheckBox
          {...field.registerField({
            name: "only_expunge_deletes",
          })}
          label="Only expunge delete"
        />
      </CustomFormRow>
      <EuiSpacer />
    </div>
  );
};

export default ForceMergeAdvancedOptions;
