/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFilterButton, EuiFilterButtonProps, EuiFilterGroup, EuiFilterSelectItem, EuiPopover } from "@elastic/eui";
import React, { useState } from "react";

export interface IFilterGroupProps {
  options: Array<{ label: string }>;
  value?: string[];
  filterButtonProps?: EuiFilterButtonProps;
  onChange?: (val: IFilterGroupProps["value"]) => void;
}

export default function FilterGroup({ options, value, filterButtonProps, onChange }: IFilterGroupProps) {
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
