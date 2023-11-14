/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiTextArea } from "@elastic/eui";
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

      <EuiFormRow isInvalid={!!policyIdError} error={policyIdError}>
        <EuiFieldText
          disabled={isEdit}
          isInvalid={!!policyIdError}
          placeholder="hot_cold_workflow"
          readOnly={false}
          value={policyId}
          onChange={onChangePolicyId}
          data-test-subj="create-policy-policy-id"
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormCustomLabel title="Description" helpText="Describe the policy." />

      <EuiFormRow isInvalid={false} error={null}>
        <EuiTextArea
          style={{ minHeight: "150px" }}
          compressed={true}
          value={description}
          onChange={onChangeDescription}
          data-test-subj="create-policy-description"
        />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

export default PolicyInfo;
