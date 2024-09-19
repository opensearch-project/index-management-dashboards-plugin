/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import {
  EuiSpacer,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiText,
  EuiPanel,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiTitle,
} from "@elastic/eui";

interface ConfigurePolicyProps {
  policyId: string;
  policyIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  useNewUx?: boolean;
}

const ConfigurePolicy = ({ isEdit, policyId, policyIdError, onChange, useNewUx }: ConfigurePolicyProps) => (
  <EuiPanel>
    <EuiFlexGroup gutterSize="xs" alignItems="center">
      <EuiTitle size="s">
        <h2>{`Name policy`}</h2>
      </EuiTitle>
    </EuiFlexGroup>
    <EuiHorizontalRule margin={"xs"} />
    {useNewUx ? (
      <></>
    ) : (
      <>
        <EuiText size="xs">
          <p>Policies let you automatically perform administrative operations on indices.</p>
        </EuiText>
        <EuiSpacer size="s" />
      </>
    )}
    <EuiCompressedFormRow
      label={
        <EuiText size="s">
          <h3>{"Policy ID"}</h3>
        </EuiText>
      }
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
  </EuiPanel>
);

// @ts-ignore
export default ConfigurePolicy;
