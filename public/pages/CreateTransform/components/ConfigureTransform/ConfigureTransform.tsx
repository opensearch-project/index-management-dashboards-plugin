/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea, EuiText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

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
  <ContentPanel panelStyles={{ padding: "20px 20px" }} bodyStyles={{ padding: "10px" }} title="Job name and description" titleSize="m">
    <div>
      <EuiFormRow label="Name" helpText="Specify a unique, descriptive name." isInvalid={!!transformIdError} error={transformIdError}>
        <EuiFieldText
          isInvalid={!!transformIdError}
          placeholder="my-transformjob1"
          value={transformId}
          onChange={onChangeName}
          disabled={isEdit}
        />
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
