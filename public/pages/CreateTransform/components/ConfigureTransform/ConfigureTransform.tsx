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
} from "@elastic/eui";

interface ConfigureTransformProps {
  isEdit: boolean;
  transformId: string;
  transformIdError: string;
  onChangeName: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

const ConfigureTransform = ({
  isEdit,
  transformId,
  transformIdError,
  onChangeName,
  onChangeDescription,
  description,
}: ConfigureTransformProps) => (
  <EuiPanel>
    <EuiText size="s">
      <h2>Job name and description</h2>
    </EuiText>
    <EuiHorizontalRule margin="xs" />
    <div>
      <EuiCompressedFormRow
        label={
          <EuiText size="s">
            <h3>Name</h3>
          </EuiText>
        }
        helpText="Specify a unique, descriptive name."
        isInvalid={!!transformIdError}
        error={transformIdError}
      >
        <EuiCompressedFieldText
          isInvalid={!!transformIdError}
          placeholder="my-transformjob1"
          value={transformId}
          onChange={onChangeName}
          disabled={isEdit}
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
