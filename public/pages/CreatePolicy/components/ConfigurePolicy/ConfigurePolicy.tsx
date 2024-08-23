/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiCompressedFormRow, EuiCompressedFieldText, EuiText, EuiPanel, EuiHorizontalRule, EuiFlexGroup } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";

interface ConfigurePolicyProps {
  policyId: string;
  policyIdError: string;
  isEdit: boolean;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  useNewUx?: boolean;
}

const ConfigurePolicy = ({ isEdit, policyId, policyIdError, onChange, useNewUx }: ConfigurePolicyProps) =>
  !useNewUx ? (
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
  ) : (
    <EuiPanel>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" style={{ padding: "0px 10px" }}>
        <EuiText size="s">
          <h2>{`Name policy`}</h2>
        </EuiText>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiHorizontalRule margin={"xs"} />
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
    </EuiPanel>
  );

// @ts-ignore
export default ConfigurePolicy;
