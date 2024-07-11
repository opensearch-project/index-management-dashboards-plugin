/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef, useState, forwardRef } from "react";
import { EuiCompressedComboBox, EuiComboBoxProps } from "@elastic/eui";
import { useEffect } from "react";
import { debounce } from "lodash";
import { ServerResponse } from "../../../server/models/types";

export interface RemoteSelectProps extends Omit<EuiComboBoxProps<{ label: string }>, "value" | "onChange"> {
  value?: string[];
  onChange?: (value: Required<RemoteSelectProps>["value"]) => void;
  onOptionsChange?: (options: { label: string; [key: string]: any }[]) => void;
  refreshOptions: (params: { searchValue?: string }) => Promise<ServerResponse<{ label: string; [key: string]: any }[]>>;
}

const RemoteSelect = forwardRef((props: RemoteSelectProps, ref: React.Ref<HTMLInputElement>) => {
  const { value = [], onChange, refreshOptions: refreshOptionsFromProps, onOptionsChange, ...others } = props;
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
          if (destroyRef.current) {
            return;
          }
          if (res?.ok && res.response) {
            setAllOptions(res.response);
          } else {
            setAllOptions([]);
          }
        })
        .finally(() => {
          if (destroyRef.current) {
            return;
          }
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
  useEffect(() => {
    onOptionsChange && onOptionsChange(allOptions);
  }, [allOptions]);
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
    <EuiCompressedComboBox
      onCreateOption={onCreateOption}
      {...others}
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
