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
    <div>
      <CustomFormRow
        isInvalid={!!field.getError("max_num_segments")}
        error={field.getError("max_num_segments")}
        label="Index segments"
        helpText="Define how many segments to merge to."
      >
        <SwitchNumber
          {...field.registerField({
            name: "max_num_segments",
            rules: [
              {
                validator(rule, value) {
                  const formatValue = Number(value);
                  if (Number.isNaN(formatValue.valueOf())) {
                    return Promise.resolve("");
                  } else if (formatValue.valueOf() % 1 !== 0 || formatValue.valueOf() < 1) {
                    return Promise.reject("Must be an integer great than or equal to 1.");
                  }

                  return Promise.resolve("");
                },
              },
            ],
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
        label="Remove deleted documents"
        fullWidth
        helpText="Expunge all segments containing more than 10% of deleted documents. The percentage is configurable in the index.merge.policy.expunge_deletes_allowed setting."
      >
        <AllBuiltInComponents.CheckBox
          {...field.registerField({
            name: "only_expunge_deletes",
          })}
          label="Completely remove deleted documents"
        />
      </CustomFormRow>
    </div>
  );
};

export default ForceMergeAdvancedOptions;
