/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { useState } from "react";
import { EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiSpacer, EuiText } from "@elastic/eui";
import { TransformAggItem } from "../../../../../../../models/interfaces";

interface EditTransformPanelProps {
  name: string;
  aggList: TransformAggItem[];
  onEditTransformation: (oldName: string, newName: string) => void;
  closePopover: () => void;
}

export default function EditTransformPanel({ name, aggList, onEditTransformation, closePopover }: EditTransformPanelProps) {
  const [transformName, setTransformName] = useState(name);
  const [transformNameError, setTransformNameError] = useState("");

  // Function to check if newName is already used
  const validateName = (newName: string) => {
    const isDuplicate = aggList.some((item) => {
      return item.name === newName;
    });

    if (name !== newName && isDuplicate) setTransformNameError(`Transformation with name "${newName}"  already exists`);
    else setTransformNameError("");
  };

  return (
    <EuiPanel>
      <EuiFormRow label="Transformation name" isInvalid={transformNameError !== ""} error={transformNameError}>
        <EuiFieldText
          value={transformName}
          isInvalid={transformNameError !== ""}
          onChange={(e) => {
            validateName(e.target.value);
            setTransformName(e.target.value);
          }}
        />
      </EuiFormRow>
      <EuiSpacer size="s" />
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
            disabled={transformNameError !== ""}
            onClick={() => {
              // Update transform name if new value specified
              if (name !== transformName) onEditTransformation(name, transformName);
              closePopover();
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
