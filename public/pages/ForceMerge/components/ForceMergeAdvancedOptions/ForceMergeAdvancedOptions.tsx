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
      <CustomFormRow label="Flush indices" helpText="If true, Opensearch will perform a flush on the indices after the force merge.">
        <AllBuiltInComponents.Switch
          {...field.registerField({
            name: "flush",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow
        label="Only expunge delete"
        helpText="If true, expunge all segments containing more than index.merge.policy.expunge_deletes_allowed (default to 10) percents of deleted documents."
      >
        <AllBuiltInComponents.Switch
          {...field.registerField({
            name: "only_expunge_deletes",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
      <CustomFormRow label="Max number of segments" helpText="The number of segments to merge to. To fully merge indices, set it to 1.">
        <SwitchNumber
          {...field.registerField({
            name: "max_num_segments",
          })}
        />
      </CustomFormRow>
      <EuiSpacer />
    </div>
  );
};

export default ForceMergeAdvancedOptions;
