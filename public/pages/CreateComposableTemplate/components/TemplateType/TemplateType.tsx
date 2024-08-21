import { EuiCompressedRadio } from "@elastic/eui";
import { TEMPLATE_TYPE } from "../../../../utils/constants";
import React from "react";

export interface ITemplateTypeProps {
  value?: {};
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
        onChange={(e) => e.target.checked && onChange({})}
        label={TEMPLATE_TYPE.DATA_STREAM}
        checked={value !== undefined}
      />
    </>
  );
}

export const TemplateConvert = (props: Pick<ITemplateTypeProps, "value">) =>
  props.value === undefined ? TEMPLATE_TYPE.INDEX_TEMPLATE : TEMPLATE_TYPE.DATA_STREAM;
