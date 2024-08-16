import { EuiFilterButton, EuiFilterButtonProps, EuiFilterGroup, EuiFilterSelectItem, EuiPopover } from "@elastic/eui";
import React, { useState } from "react";

export interface IFilterGroupProps {
  options: { label: string }[];
  value?: string[];
  filterButtonProps?: EuiFilterButtonProps;
  useNewUX?: boolean;
  onChange?: (val: IFilterGroupProps["value"]) => void;
}

export default function FilterGroup({ options, value, filterButtonProps, onChange, useNewUX }: IFilterGroupProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <EuiFilterGroup>
      <EuiPopover
        button={
          <EuiFilterButton
            iconType="arrowDown"
            onClick={onButtonClick}
            isSelected={isPopoverOpen}
            numFilters={options?.length}
            hasActiveFilters={!!value?.length}
            numActiveFilters={value?.length}
            size={useNewUX ? "s" : undefined}
            {...filterButtonProps}
          />
        }
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        panelPaddingSize="none"
      >
        <div className="ouiFilterSelect__items">
          {options.map((item, index) => (
            <EuiFilterSelectItem
              checked={value?.includes(item.label) ? "on" : "off"}
              key={item.label}
              data-test-subj={`FilterGroupSelectItem-${item.label}`}
              onClick={() => {
                const findIndex = (value || []).findIndex((valueItem) => valueItem === item.label);
                const finalValue = value || [];
                if (findIndex > -1) {
                  finalValue.splice(findIndex, 1);
                } else {
                  finalValue.push(item.label);
                }
                onChange?.([...finalValue]);
              }}
            >
              {item.label}
            </EuiFilterSelectItem>
          ))}
        </div>
      </EuiPopover>
    </EuiFilterGroup>
  );
}
