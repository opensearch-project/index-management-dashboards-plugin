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
import { EuiRadio, EuiSpacer } from "@elastic/eui";
import React from "react";
import { TEMPLATE_TYPE } from "../../../../utils/constants";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import CustomFormRow from "../../../../components/CustomFormRow";

export interface ITemplateTypeProps {
  value?: {
    timestamp_field?: {
      name: string;
    };
  };
  onChange: (val: ITemplateTypeProps["value"]) => void;
}

export default function TemplateType(props: ITemplateTypeProps) {
  const { value, onChange } = props;
  return (
    <>
      <EuiRadio
        id={TEMPLATE_TYPE.INDEX_TEMPLATE}
        onChange={(e) => e.target.checked && onChange(undefined)}
        label={TEMPLATE_TYPE.INDEX_TEMPLATE}
        checked={value === undefined}
      />
      <EuiRadio
        id={TEMPLATE_TYPE.DATA_STREAM}
        onChange={(e) =>
          e.target.checked &&
          onChange({
            timestamp_field: {
              name: "@timestamp",
            },
          })
        }
        label={TEMPLATE_TYPE.DATA_STREAM}
        checked={value !== undefined}
      />
      {value !== undefined ? (
        <>
          <EuiSpacer />
          <CustomFormRow label="Time field">
            <AllBuiltInComponents.Input
              value={value?.timestamp_field?.name}
              onChange={(val) => {
                if (!val) {
                  onChange({});
                } else {
                  onChange({
                    timestamp_field: {
                      name: val,
                    },
                  });
                }
              }}
            />
          </CustomFormRow>
        </>
      ) : null}
    </>
  );
}

export const TemplateConvert = (props: Pick<ITemplateTypeProps, "value">) =>
  props.value === undefined ? TEMPLATE_TYPE.INDEX_TEMPLATE : TEMPLATE_TYPE.DATA_STREAM;
