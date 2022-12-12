/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useRef } from "react";
import { EuiComboBoxProps } from "@elastic/eui";
import RemoteSelect, { RemoteSelectProps } from "../../../../components/RemoteSelect";
import { ServerResponse } from "../../../../../server/models/types";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS } from "../../../../../utils/constants";

export interface AliasSelectProps extends Omit<EuiComboBoxProps<{ label: string; value: string }>, "value" | "onChange"> {
  value?: Record<string, {}>;
  onChange?: (value: AliasSelectProps["value"]) => void;
  refreshOptions: (aliasName: string) => Promise<ServerResponse<{ alias: string }[]>>;
}

const transformObjToArray = (obj: AliasSelectProps["value"]): { label: string }[] => {
  return Object.keys(obj || {}).map((label) => ({ label }));
};
const transformArrayToObj = (array: { label: string; [key: string]: any }[]): AliasSelectProps["value"] => {
  return array.reduce((total, { label, ...others }) => ({ ...total, [label]: others || {} }), {});
};

const AliasSelect = forwardRef((props: AliasSelectProps, ref: React.Ref<HTMLInputElement>) => {
  const { value, onChange, refreshOptions: refreshOptionsFromProps } = props;
  const optionsRef = useRef<{ label: string; [key: string]: any }[]>([]);
  const refreshOptions: RemoteSelectProps["refreshOptions"] = ({ searchValue }) => {
    return refreshOptionsFromProps(searchValue || "").then((res) => {
      if (res.ok) {
        return {
          ...res,
          response: [...new Set(res.response.filter((item) => !filterByMinimatch(item.alias, SYSTEM_ALIAS)))].map(
            ({ alias, ...others }) => ({
              ...others,
              label: alias,
            })
          ),
        };
      } else {
        return res;
      }
    });
  };
  return (
    <RemoteSelect
      {...(props as Partial<EuiComboBoxProps<any>>)}
      onOptionsChange={(options) => (optionsRef.current = options)}
      placeholder="Select or create aliases"
      customOptionText="Add {searchValue} as a new alias"
      refreshOptions={refreshOptions}
      value={transformObjToArray(value).map((item) => item.label)}
      onChange={(val) => {
        onChange && onChange(transformArrayToObj(val.map((label) => optionsRef.current.find((item) => item.label === label) || { label })));
      }}
    />
  );
});

AliasSelect.displayName = "AliasSelect";

// @ts-ignore
export default AliasSelect;
