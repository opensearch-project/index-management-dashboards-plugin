/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiCompressedFormRow, EuiFieldText, EuiTextArea } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

interface PolicyInfoProps {
  isEdit: boolean;
  policyId: string;
  policyIdError: string;
  description: string;
  onChangePolicyId: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

const PolicyInfo = ({ isEdit, policyId, policyIdError, description, onChangePolicyId, onChangeDescription }: PolicyInfoProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Policy info" titleSize="s">
    <div style={{ padding: "10px 0px 0px 10px" }}>
      <EuiFormCustomLabel title="Policy ID" helpText="Specify a unique and descriptive ID that is easy to recognize and remember." />

      <EuiCompressedFormRow isInvalid={!!policyIdError} error={policyIdError}>
        <EuiFieldText
          disabled={isEdit}
          isInvalid={!!policyIdError}
          placeholder="hot_cold_workflow"
          readOnly={false}
          value={policyId}
          onChange={onChangePolicyId}
          data-test-subj="create-policy-policy-id"
        />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />

      <EuiFormCustomLabel title="Description" helpText="Describe the policy." />

      <EuiCompressedFormRow isInvalid={false} error={null}>
        <EuiTextArea
          style={{ minHeight: "150px" }}
          compressed={true}
          value={description}
          onChange={onChangeDescription}
          data-test-subj="create-policy-description"
        />
      </EuiCompressedFormRow>
    </div>
  </ContentPanel>
);

export default PolicyInfo;
