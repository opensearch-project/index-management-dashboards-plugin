/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigurePolicyProps {
  policyId: string;
  policyIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  useNewUx?: boolean;
}

const ConfigurePolicy = ({ isEdit, policyId, policyIdError, onChange, useNewUx }: ConfigurePolicyProps) => (
  <ContentPanel bodyStyles={useNewUx ? { padding: "0px 0px" } : { padding: "initial" }} title="Name policy" titleSize="s">
    <div style={{ paddingLeft: "10px" }}>
      {!useNewUx ? (
        <EuiText size="xs">
          <p>Policies let you automatically perform administrative operations on indices.</p>
        </EuiText>
      ) : (
        <></>
      )}
      <EuiSpacer size="s" />
      <EuiFormRow
        label="Policy ID"
        helpText="Specify a unique ID that is easy to recognize and remember."
        isInvalid={!!policyIdError}
        error={policyIdError}
      >
        <EuiFieldText isInvalid={!!policyIdError} placeholder="example_policy" readOnly={isEdit} value={policyId} onChange={onChange} />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

// @ts-ignore
export default ConfigurePolicy;
