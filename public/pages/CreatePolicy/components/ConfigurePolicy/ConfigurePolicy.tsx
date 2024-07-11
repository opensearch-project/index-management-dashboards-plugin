/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiCompressedFormRow, EuiCompressedFieldText, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigurePolicyProps {
  policyId: string;
  policyIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
}

const ConfigurePolicy = ({ isEdit, policyId, policyIdError, onChange }: ConfigurePolicyProps) => (
  <ContentPanel bodyStyles={{ padding: "initial" }} title="Name policy" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>Policies let you automatically perform administrative operations on indices.</p>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label="Policy ID"
        helpText="Specify a unique ID that is easy to recognize and remember."
        isInvalid={!!policyIdError}
        error={policyIdError}
      >
        <EuiCompressedFieldText
          isInvalid={!!policyIdError}
          placeholder="example_policy"
          readOnly={isEdit}
          value={policyId}
          onChange={onChange}
        />
      </EuiCompressedFormRow>
    </div>
  </ContentPanel>
);

// @ts-ignore
export default ConfigurePolicy;
