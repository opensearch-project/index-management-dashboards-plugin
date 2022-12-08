/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { EuiFormRow, EuiFormRowProps } from "@elastic/eui";
import { set } from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import AliasSelect, { AliasSelectProps } from "../../../CreateIndex/components/AliasSelect";
import IndexMapping, { IIndexMappingsRef } from "../../../CreateIndex/components/IndexMapping";
import { TemplateItem } from "../../../../../models/interfaces";
import { Ref } from "react";
import useField from "../../../../lib/field";

export interface TemplateDetailProps {
  value?: Partial<TemplateItem>;
  oldValue?: Partial<TemplateItem>;
  onChange: (value: TemplateDetailProps["value"]) => void;
  isEdit?: boolean;
  readonly?: boolean;
  refreshOptions: AliasSelectProps["refreshOptions"];
}

export interface ITemplateDetailRef {
  validate: () => Promise<boolean>;
}

const TemplateDetail = (
  { value, onChange, isEdit, readonly, oldValue, refreshOptions }: TemplateDetailProps,
  ref: Ref<ITemplateDetailRef>
) => {
  const field = useField();
  const getCommonFormRowProps = useCallback(
    (name: string): Partial<EuiFormRowProps> => {
      return {
        isInvalid: !!field.getError(name),
        error: field.getError(name),
      };
    },
    [field]
  );
  const onValueChange = useCallback(
    (name: string | string[], val) => {
      let finalValue = value || {};
      set(finalValue, name, val);
      onChange({ ...finalValue });
    },
    [onChange, value]
  );
  const destroyRef = useRef<boolean>(false);
  const finalValue = value || {};
  const mappingsRef = useRef<IIndexMappingsRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const { errors } = await field.validatePromise();
      if (errors) {
        return false;
      }
      const mappingsValidateResult = await mappingsRef.current?.validate();
      if (mappingsValidateResult) {
        return false;
      }

      return true;
    },
  }));
  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);
  return (
    <>
      <ContentPanel title="Index mapping" titleSize="s">
        <div style={{ paddingLeft: "10px" }}>
          <EuiFormRow fullWidth>
            <IndexMapping
              isEdit={isEdit}
              value={finalValue?.mappings?.properties}
              oldValue={oldValue?.mappings?.properties}
              onChange={(val) => onValueChange("mappings.properties", val)}
              ref={mappingsRef}
              readonly={readonly}
            />
          </EuiFormRow>
        </div>
      </ContentPanel>
    </>
  );
};

// @ts-ignore
export default forwardRef(TemplateDetail);
