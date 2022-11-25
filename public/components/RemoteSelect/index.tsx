/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState, forwardRef } from "react";
import { EuiComboBox, EuiComboBoxProps } from "@elastic/eui";
import { useEffect } from "react";
import { debounce } from "lodash";
import { ServerResponse } from "../../../server/models/types";

export interface RemoteSelectProps extends Omit<EuiComboBoxProps<{ label: string }>, "value" | "onChange"> {
  value?: string[];
  onChange?: (value: Required<RemoteSelectProps>["value"]) => void;
  refreshOptions: (params: { searchValue?: string }) => Promise<ServerResponse<{ label: string }[]>>;
}

const RemoteSelect = forwardRef((props: RemoteSelectProps, ref: React.Ref<HTMLInputElement>) => {
  const { value = [], onChange, refreshOptions: refreshOptionsFromProps, ...others } = props;
  const [allOptions, setAllOptions] = useState([] as { label: string }[]);
  const [isLoading, setIsLoading] = useState(false);
  const destroyRef = useRef(false);
  const refreshOptionsWithoutDebounce = useCallback(
    (params) => {
      if (destroyRef.current) {
        return;
      }
      setIsLoading(true);
      refreshOptionsFromProps(params)
        .then((res: ServerResponse<{ label: string }[]>) => {
          if (res.ok && res.response) {
            setAllOptions(res.response);
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
    refreshOptionsWithoutDebounce({ searchValue: "" });
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
      onChange && onChange([...value, newOption.label]);
    }
  };
  return (
    <EuiComboBox
      onCreateOption={onCreateOption}
      {...others}
      async
      inputRef={ref as (instance: HTMLInputElement | null) => void}
      selectedOptions={value?.map((item) => ({ label: item }))}
      onChange={(value) => {
        onChange && onChange(value.map((item) => item.label));
      }}
      options={allOptions}
      isLoading={isLoading}
      onSearchChange={(searchValue) => {
        setIsLoading(true);
        refreshOptions({ searchValue });
      }}
    />
  );
});

RemoteSelect.displayName = "RemoteSelect";

// @ts-ignore
export default RemoteSelect;
