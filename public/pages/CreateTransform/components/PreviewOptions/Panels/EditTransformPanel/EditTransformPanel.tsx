/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
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
      <EuiFormRow label="Transformation name">
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
      <EuiText color="danger" size="xs">
        {transformNameError}
      </EuiText>
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
