/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiCompressedRadio, EuiSpacer } from "@elastic/eui";
import { TEMPLATE_TYPE } from "../../../../utils/constants";
import React from "react";
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
      <EuiCompressedRadio
        id={TEMPLATE_TYPE.INDEX_TEMPLATE}
        onChange={(e) => e.target.checked && onChange(undefined)}
        label={TEMPLATE_TYPE.INDEX_TEMPLATE}
        checked={value === undefined}
      />
      <EuiCompressedRadio
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
