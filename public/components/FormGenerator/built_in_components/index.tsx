/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { forwardRef, useRef } from "react";
import {
  EuiCompressedFieldNumber,
  EuiCompressedFieldText,
  EuiSwitch,
  EuiCompressedSelect,
  EuiText,
  EuiCompressedCheckbox,
  EuiComboBoxOptionOption,
} from "@elastic/eui";
import EuiToolTipWrapper, { IEuiToolTipWrapperProps } from "../../EuiToolTipWrapper";
import EuiComboBox from "../../ComboBoxWithoutWarning";

export type ComponentMapEnum = "Input" | "Number" | "Switch" | "Select" | "Text" | "ComboBoxSingle" | "CheckBox" | "ComboBoxMultiple";

export interface IFieldComponentProps extends IEuiToolTipWrapperProps {
  onChange: (val: IFieldComponentProps["value"], ...args: any) => void;
  value?: any;
  [key: string]: any;
}

let globalId = 0;

const componentMap: Record<ComponentMapEnum, React.ComponentType<IFieldComponentProps>> = {
  Input: EuiToolTipWrapper(
    forwardRef(({ onChange, value, removeWhenEmpty, ...others }, ref: React.Ref<HTMLInputElement>) => (
      <EuiCompressedFieldText
        inputRef={ref}
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? e.target.value : removeWhenEmpty ? undefined : e.target.value)}
        {...others}
      />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Number: EuiToolTipWrapper(
    forwardRef(({ onChange, value, removeWhenEmpty, ...others }, ref: React.Ref<HTMLInputElement>) => (
      <EuiCompressedFieldNumber
        inputRef={ref}
        onChange={(e) => onChange(e.target.value ? e.target.value : removeWhenEmpty ? undefined : e.target.value)}
        value={value === undefined ? "" : value}
        {...others}
      />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Switch: EuiToolTipWrapper(
    forwardRef(({ value, onChange, ...others }, ref: React.Ref<any>) => (
      <div ref={ref}>
        <EuiSwitch showLabel={false} label="" checked={value || false} onChange={(e) => onChange(e.target.checked)} {...others} />
      </div>
    )) as React.ComponentType<IFieldComponentProps>
  ),
  Text: forwardRef(({ value }, ref: React.Ref<any>) => (
    <div ref={ref}>
      <EuiText title={value || "-"}>{value || "-"}</EuiText>
    </div>
  )) as React.ComponentType<IFieldComponentProps>,
  Select: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => (
      <EuiCompressedSelect inputRef={ref} onChange={(e) => onChange(e.target.value)} value={value || ""} {...others} />
    )) as React.ComponentType<IFieldComponentProps>
  ),
  CheckBox: EuiToolTipWrapper(
    forwardRef(({ onChange, value, ...others }, ref: React.Ref<any>) => {
      const idRef = useRef(globalId++);
      return (
        <EuiCompressedCheckbox
          ref={ref}
          id={`builtInCheckBoxId-${idRef.current}`}
          checked={value === undefined ? false : value}
          onChange={(e) => onChange(e.target.checked)}
          {...others}
        />
      );
    }) as React.ComponentType<IFieldComponentProps>
  ),
  ComboBoxSingle: EuiToolTipWrapper(
    forwardRef(({ onChange, value, options, ...others }, ref: React.Ref<any>) => {
      return (
        <EuiComboBox
          onCreateOption={(searchValue) => {
            const allOptions = (options as { label: string; options?: { label: string }[] }[]).reduce((total, current) => {
              if (current.options) {
                return [...total, ...current.options];
              } else {
                return [...total, current];
              }
            }, [] as { label: string }[]);
            const findItem = allOptions.find((item: { label: string }) => item.label === searchValue);
            if (findItem) {
              onChange(searchValue);
            }
          }}
          {...others}
          options={options}
          singleSelection={{ asPlainText: true }}
          ref={ref}
          onChange={(selectedOptions) => {
            if (selectedOptions && selectedOptions[0]) {
              onChange(selectedOptions[0].label, selectedOptions[0]);
            } else {
              onChange(undefined);
            }
          }}
          selectedOptions={[value].filter((item) => item !== undefined).map((label) => ({ label: `${label}` }))}
        />
      );
    })
  ) as React.ComponentType<IFieldComponentProps>,
  ComboBoxMultiple: EuiToolTipWrapper(
    forwardRef(
      (
        {
          onChange,
          value,
          ...others
        }: {
          value?: string[];
          options: EuiComboBoxOptionOption<string>[];
          onChange: (val: string[], values: EuiComboBoxOptionOption<string>[], ...args: any) => void;
        },
        ref: React.Ref<any>
      ) => {
        return (
          <EuiComboBox
            onCreateOption={(searchValue) => {
              const allOptions = others.options.reduce((total, current) => {
                if (current.options) {
                  return [...total, ...current.options];
                } else {
                  return [...total, current];
                }
              }, [] as EuiComboBoxOptionOption<string>[]);
              const findItem = allOptions.find((item: { label: string }) => item.label === searchValue);
              if (findItem) {
                onChange(
                  [...(value || []), searchValue],
                  [
                    ...allOptions.filter((item) => value?.includes(item.label)),
                    {
                      label: searchValue,
                    },
                  ]
                );
              }
            }}
            {...others}
            ref={ref}
            onChange={(selectedOptions) => {
              onChange(selectedOptions.map((item) => item.value) as string[], selectedOptions);
            }}
            selectedOptions={
              (value || [])
                .map((item: string) => others.options.find((option) => option.value === item) || { label: item, value: item })
                .filter((item) => item !== undefined) as EuiComboBoxOptionOption<string>[]
            }
          />
        );
      }
    )
  ) as React.ComponentType<IFieldComponentProps>,
};

export default componentMap;
