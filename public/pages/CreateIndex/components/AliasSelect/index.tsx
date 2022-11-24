/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState, forwardRef } from "react";
import { EuiComboBox, EuiComboBoxProps } from "@elastic/eui";
import { useEffect } from "react";
import { debounce } from "lodash";
import { ServerResponse } from "../../../../../server/models/types";

export interface AliasSelectProps extends Omit<EuiComboBoxProps<{ label: string; value: string }>, "value" | "onChange"> {
  value?: Record<string, {}>;
  onChange?: (value: AliasSelectProps["value"]) => void;
  refreshOptions: (aliasName: string) => Promise<ServerResponse<{ alias: string }[]>>;
}

const transformObjToArray = (obj: AliasSelectProps["value"]): { label: string }[] => {
  return Object.keys(obj || {}).map((label) => ({ label }));
};
const transformArrayToObj = (array: { label: string }[]): AliasSelectProps["value"] => {
  return array.reduce((total, current) => ({ ...total, [current.label]: {} }), {});
};

const AliasSelect = forwardRef((props: AliasSelectProps, ref: React.Ref<HTMLInputElement>) => {
  const { value, onChange, refreshOptions: refreshOptionsFromProps, ...others } = props;
  const finalValue = transformObjToArray(value);
  const [allOptions, setAllOptions] = useState([] as { label: string }[]);
  const [isLoading, setIsLoading] = useState(false);
  const destroyRef = useRef(false);
  const refreshOptionsWithoutDebounce = useCallback(
    ({ aliasName }) => {
      if (destroyRef.current) {
        return;
      }
      setIsLoading(true);
      refreshOptionsFromProps(aliasName)
        .then((res: ServerResponse<{ alias: string }[]>) => {
          if (res.ok && res.response) {
            setAllOptions(
              [...new Set(res.response.map((item) => item.alias).filter((item) => !item.startsWith(".")))].map((item) => ({ label: item }))
            );
          } else {
            setAllOptions([]);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [refreshOptionsFromProps, setAllOptions, setIsLoading]
  );
  const refreshOptions = useCallback(debounce(refreshOptionsWithoutDebounce, 500), [refreshOptionsWithoutDebounce]);
  useEffect(() => {
    refreshOptionsWithoutDebounce({});
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const onCreateOption = (searchValue: string, flattenedOptions: { label: string }[] = []) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (flattenedOptions.findIndex((option: { label: string }) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      setAllOptions([...allOptions, newOption]);
      onChange && onChange(transformArrayToObj([...finalValue, newOption]));
    }
  };
  return (
    <EuiComboBox
      {...others}
      inputRef={ref as (instance: HTMLInputElement | null) => void}
      placeholder="Select or create aliases"
      selectedOptions={finalValue}
      onChange={(value) => {
        onChange && onChange(transformArrayToObj(value));
      }}
      options={allOptions}
      isLoading={isLoading}
      customOptionText={"Add {searchValue} as a new alias"}
      onCreateOption={onCreateOption}
    />
  );
});

// @ts-ignore
export default AliasSelect;
