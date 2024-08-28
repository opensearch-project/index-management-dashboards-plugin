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
  EuiHorizontalRule,
  EuiPanel,
} from "@elastic/eui";

interface ConfigureRollupProps {
  isEdit: boolean;
  rollupId: string;
  rollupIdError: string;
  onChangeName: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

const ConfigureRollup = ({ isEdit, rollupId, rollupIdError, onChangeName, onChangeDescription, description }: ConfigureRollupProps) => (
  <EuiPanel>
    <EuiFlexGroup gutterSize="xs" alignItems="center">
      <EuiText size="s">
        <h2>Job name and description</h2>
      </EuiText>
    </EuiFlexGroup>
    <EuiHorizontalRule margin={"xs"} />
    <EuiSpacer size="s" />
    <EuiCompressedFormRow
      label={
        <EuiText size="s">
          <h3>Name</h3>
        </EuiText>
      }
      helpText="Specify a unique, descriptive name."
      isInvalid={!!rollupIdError}
      error={rollupIdError}
    >
      <EuiCompressedFieldText
        isInvalid={!!rollupIdError}
        placeholder="my-rollupjob1"
        value={rollupId}
        onChange={onChangeName}
        disabled={isEdit}
      />
    </EuiCompressedFormRow>
    <EuiSpacer />
    <EuiFlexGroup gutterSize="xs" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <h3>Description</h3>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText color="subdued">
          <i> – optional</i>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="xs" />
    <EuiCompressedFormRow>
      <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} data-test-subj="description" />
    </EuiCompressedFormRow>
  </EuiPanel>
);
export default ConfigureRollup;
