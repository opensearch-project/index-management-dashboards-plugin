/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiCompressedFormRow, EuiCompressedFieldText, EuiTextArea, EuiText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigureRollupProps {
  isEdit: boolean;
  rollupId: string;
  rollupIdError: string;
  onChangeName: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

const ConfigureRollup = ({ isEdit, rollupId, rollupIdError, onChangeName, onChangeDescription, description }: ConfigureRollupProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Job name and description" titleSize="m">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiCompressedFormRow label="Name" helpText="Specify a unique, descriptive name." isInvalid={!!rollupIdError} error={rollupIdError}>
        <EuiCompressedFieldText
          isInvalid={!!rollupIdError}
          placeholder="my-rollupjob1"
          value={rollupId}
          onChange={onChangeName}
          disabled={isEdit}
        />
      </EuiCompressedFormRow>
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
      <EuiCompressedFormRow>
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} data-test-subj="description" />
      </EuiCompressedFormRow>
    </div>
  </ContentPanel>
);
export default ConfigureRollup;
