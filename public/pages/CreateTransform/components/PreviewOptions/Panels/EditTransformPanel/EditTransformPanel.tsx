/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { EuiSmallButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiCompressedFormRow, EuiPanel, EuiSpacer, EuiText } from "@elastic/eui";
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
      <EuiCompressedFormRow label="Transformation name" isInvalid={transformNameError !== ""} error={transformNameError}>
        <EuiFieldText
          value={transformName}
          isInvalid={transformNameError !== ""}
          onChange={(e) => {
            validateName(e.target.value);
            setTransformName(e.target.value);
          }}
        />
      </EuiCompressedFormRow>
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent={"flexEnd"} gutterSize={"m"}>
        <EuiFlexItem grow={false}>
          <EuiSmallButton fullWidth={false} onClick={() => closePopover()} style={{ minWidth: 84 }}>
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
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
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}
