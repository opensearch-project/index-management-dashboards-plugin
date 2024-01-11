/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiButton, EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiSpacer } from "@elastic/eui";
import { TRANSFORM_AGG_TYPE, TransformAggItem } from "../../../../../../../models/interfaces";

interface PercentilePanelProps {
  name: string;
  aggSelection: any;
  handleAggSelectionChange: (aggItem: TransformAggItem) => void;
  closePopover: () => void;
}

export default function PercentilePanel({ name, aggSelection, handleAggSelectionChange, closePopover }: PercentilePanelProps) {
  const [percents, setPercents] = useState<Array<{ label: string }>>([]);
  const [isInvalid, setInvalid] = useState(false);

  const onChangePercents = (selectedPercent: Array<{ label: string }>): void => {
    setPercents(selectedPercent);
    setInvalid(false);
  };

  const isValidPercent = (value: string) => {
    // Only numbers between 0-100 including decimals. No spaces, numbers, or special characters.
    const numericValue = parseFloat(value);
    return numericValue >= 0.0 && numericValue <= 100.0;
  };

  const onCreateOption = (searchValue: string) => {
    if (!isValidPercent(searchValue)) {
      // Return false to explicitly reject the user's input.
      return false;
    }

    const newOption = {
      label: searchValue,
    };

    // Select the option.
    setPercents([...percents, newOption]);
  };

  const onSearchChange = (searchValue: string) => {
    if (!searchValue) {
      setInvalid(false);

      return;
    }

    setInvalid(!isValidPercent(searchValue));
  };

  return (
    <EuiPanel>
      <EuiFlexGroup gutterSize={"none"}>
        <EuiFlexItem grow={false} style={{ width: 230 }}>
          <EuiFormRow
            fullWidth={true}
            label="Percents"
            helpText="Only numbers between 0-100 allowed."
            isInvalid={isInvalid}
            error={isInvalid ? "Invalid input" : undefined}
          >
            <EuiComboBox
              fullWidth={true}
              noSuggestions
              selectedOptions={percents}
              onChange={onChangePercents}
              onCreateOption={onCreateOption}
              isInvalid={isInvalid}
              onSearchChange={onSearchChange}
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
        </EuiFlexItem>
        <EuiFlexItem grow={false} />
      </EuiFlexGroup>
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            fullWidth={false}
            onClick={() => {
              const aggItem: TransformAggItem = {
                type: TRANSFORM_AGG_TYPE.percentiles,
                name: `percentiles_${name}`,
                item: {
                  percentiles: {
                    field: name,
                    percents: percents.map((value) => parseFloat(value.label)),
                  },
                },
              };
              aggSelection[`percentiles_${name}`] = {
                percentiles: {
                  field: name,
                  percents: percents.map((value) => parseFloat(value.label)),
                },
              };
              handleAggSelectionChange(aggItem);
            }}
            style={{ minWidth: 55 }}
          >
            OK
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
