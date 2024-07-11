/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFormRow, EuiCompressedFieldText, EuiSpacer } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import CustomLabel from "../../../../components/CustomLabel";

interface AddPrefixesInputProps {
  getPrefix: (prefix: string) => void;
}

const AddPrefixesInput = ({ getPrefix }: AddPrefixesInputProps) => {
  const [prefix, setPrefix] = useState("restored_");

  const onPrefixChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefix(e.target.value);
    getPrefix(e.target.value);
  };

  return (
    <>
      <EuiSpacer size="l" />

      <CustomLabel title="Specify prefix for restored index names" helpText="A prefix will be added to any restored index names." />
      <EuiCompressedFormRow>
        <EuiCompressedFieldText value={prefix} onChange={onPrefixChange} data-test-subj="prefixInput" />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default AddPrefixesInput;
