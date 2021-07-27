/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";

interface PolicyInfoProps {
  policyId: string;
  description: string;
  onChangePolicyId: (value: ChangeEvent<HTMLInputElement>) => void;
  onChangeDescription: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

const PolicyInfo = ({ policyId, description, onChangePolicyId, onChangeDescription }: PolicyInfoProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Policy info" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiFormRow label="Policy Id" helpText="Specify a unique ID that is easy to recognize and remember." isInvalid={false} error={null}>
        <EuiFieldText
          isInvalid={false}
          placeholder="hot_cold_workflow"
          readOnly={false}
          value={policyId}
          onChange={onChangePolicyId}
          data-test-subj="create-policy-policy-id"
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow label="Description" helpText="Describe the policy" isInvalid={false} error={null}>
        <EuiTextArea compressed={true} value={description} onChange={onChangeDescription} data-test-subj="create-policy-description" />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

export default PolicyInfo;
