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
  onOptionsChange?: (options: Array<{ label: string; [key: string]: any }>) => void;
  refreshOptions: (params: { searchValue?: string }) => Promise<ServerResponse<Array<{ label: string; [key: string]: any }>>>;
}

const RemoteSelect = forwardRef((props: RemoteSelectProps, ref: React.Ref<HTMLInputElement>) => {
  const { value = [], onChange, refreshOptions: refreshOptionsFromProps, onOptionsChange, ...others } = props;
  const [allOptions, setAllOptions] = useState([] as Array<{ label: string }>);
  const [isLoading, setIsLoading] = useState(false);
  const destroyRef = useRef(false);
  const refreshOptionsWithoutDebounce = useCallback(
    (params) => {
      if (destroyRef.current) {
        return;
      }
      setIsLoading(true);
      refreshOptionsFromProps(params)
        .then((res: ServerResponse<Array<{ label: string }>>) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refreshOptions = useCallback(debounce(refreshOptionsWithoutDebounce, 500), [refreshOptionsWithoutDebounce]);
  useEffect(
    () => {
      refreshOptionsWithoutDebounce({ searchValue: "" });
      return () => {
        destroyRef.current = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(
    () => {
      if (onOptionsChange) onOptionsChange(allOptions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allOptions]
  );
  const onCreateOption = (searchValue: string, flattenedOptions: Array<{ label: string }> = []) => {
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
      if (onChange) onChange([...value, newOption.label]);
    }
  };
  return (
    <EuiComboBox
      onCreateOption={onCreateOption}
      {...others}
      inputRef={ref as (instance: HTMLInputElement | null) => void}
      selectedOptions={value?.map((item) => ({ label: item }))}
      onChange={(v) => {
        if (onChange) onChange(v.map((item) => item.label));
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
