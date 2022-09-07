/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFormRow, EuiFieldText, EuiSpacer } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import CustomLabel from "../../../../components/CustomLabel";

interface AddPrefixesInputProps {
  getPrefix: (prefix: string) => void;
}

const AddPrefixesInput = ({ getPrefix }: AddPrefixesInputProps) => {
  const [prefix, setPrefix] = useState("");

  const onPrefixChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefix(e.target.value);
    getPrefix(e.target.value);
  };

  return (
    <>
      <EuiSpacer size="l" />

      <CustomLabel title="Specify prefix for restored index names" helpText="A prefix will be added to any restored index names." />
      <EuiFormRow>
        <EuiFieldText value={prefix} onChange={onPrefixChange} />
      </EuiFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default AddPrefixesInput;
