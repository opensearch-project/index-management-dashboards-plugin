/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea, EuiText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
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
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Job name and description" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiSpacer size="s" />
      <EuiFormRow label="Name" helpText="Specify a unique, descriptive name." isInvalid={!!rollupIdError} error={rollupIdError}>
        <EuiFieldText isInvalid={!!rollupIdError} placeholder="my-rollupjob1" value={rollupId} onChange={onChangeName} disabled={isEdit} />
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
export default ConfigureRollup;
