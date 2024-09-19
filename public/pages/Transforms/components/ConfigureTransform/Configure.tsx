/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import {
  EuiSpacer,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiTextArea,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiHorizontalRule,
  EuiTitle,
} from "@elastic/eui";

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
  <EuiPanel>
    <EuiTitle size="s">
      <h2>Job name and description</h2>
    </EuiTitle>
    <EuiHorizontalRule margin="xs" />
    <div>
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label={
          <EuiText size="s">
            <h3>Name</h3>
          </EuiText>
        }
        helpText="Specify a unique, descriptive name."
        isInvalid={!!error}
        error={error}
      >
        <EuiCompressedFieldText
          isInvalid={!!error}
          placeholder="transform-id"
          value={transformId}
          onChange={onChangeName}
          disabled={inEdit}
        />
      </EuiCompressedFormRow>
      <EuiSpacer />
      <EuiFlexGroup gutterSize="xs">
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <h3>Description</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText size="s" color="subdued">
            <h3>
              <i> – optional</i>
            </h3>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xs" />
      <EuiCompressedFormRow>
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} data-test-subj="description" />
      </EuiCompressedFormRow>
    </div>
  </EuiPanel>
);

export default ConfigureTransform;
