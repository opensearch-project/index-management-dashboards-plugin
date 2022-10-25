/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from "react";
import { EuiComboBox } from "@elastic/eui";
import { useEffect } from "react";
import { debounce } from "lodash";
import { ServerResponse } from "../../../../../server/models/types";

export interface AliasSelectProps {
  value?: Record<string, {}>;
  onChange: (value: AliasSelectProps["value"]) => void;
  refreshOptions: (aliasName: string) => Promise<ServerResponse<{ alias: string }[]>>;
}

const transformObjToArray = (obj: AliasSelectProps["value"]): { label: string }[] => {
  return Object.keys(obj || {}).map((label) => ({ label }));
};
const transformArrayToObj = (array: { label: string }[]): AliasSelectProps["value"] => {
  return array.reduce((total, current) => ({ ...total, [current.label]: {} }), {});
};

const AliasSelect = (props: AliasSelectProps) => {
  const { value, onChange } = props;
  const finalValue = transformObjToArray(value);
  const [allOptions, setAllOptions] = useState([] as { label: string }[]);
  const [isLoading, setIsLoading] = useState(false);
  const refreshOptions = useCallback(
    debounce(({ aliasName }) => {
      setIsLoading(true);
      props
        .refreshOptions(aliasName)
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
    }, 500),
    []
  );
  useEffect(() => {
    refreshOptions({});
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
      onChange(transformArrayToObj([...finalValue, newOption]));
    }
  };
  return (
    <EuiComboBox
      placeholder="Select or create aliases"
      async
      selectedOptions={finalValue}
      onChange={(value) => onChange(transformArrayToObj(value))}
      options={allOptions}
      isLoading={isLoading}
      onSearchChange={(searchValue) => {
        setIsLoading(true);
        refreshOptions({ aliasName: searchValue });
      }}
      customOptionText={"Add {searchValue} as a new alias"}
      onCreateOption={onCreateOption}
    />
  );
};

// @ts-ignore
export default AliasSelect;
