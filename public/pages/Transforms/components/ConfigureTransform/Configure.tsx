/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea, EuiText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigureTransformProps {
  inEdit: boolean;
  transformId: string;
  error: string;
  onChangeName: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
  size: "s" | "m";
}

const ConfigureTransform = ({
  inEdit,
  transformId,
  error,
  onChangeName,
  onChangeDescription,
  description,
  size,
}: ConfigureTransformProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Job name and description" titleSize={size}>
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow label="Name" helpText="Specify a unique, descriptive name." isInvalid={!!error} error={error}>
        <EuiFieldText isInvalid={!!error} placeholder="transform-id" value={transformId} onChange={onChangeName} disabled={inEdit} />
      </EuiFormRow>
      <EuiSpacer />
      <EuiFlexGroup gutterSize="xs">
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            <h4>Description</h4>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="xs" color="subdued">
            <i> – optional</i>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xs" />
      <EuiFormRow>
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} data-test-subj="description" />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

export default ConfigureTransform;
