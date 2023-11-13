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
  const [prefix, setPrefix] = useState("restored_");

  const onPrefixChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefix(e.target.value);
    getPrefix(e.target.value);
  };

  return (
    <>
      <EuiSpacer size="l" />

      <CustomLabel title="Specify prefix for restored index names" helpText="A prefix will be added to any restored index names." />
      <EuiFormRow>
        <EuiFieldText value={prefix} onChange={onPrefixChange} data-test-subj="prefixInput" />
      </EuiFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default AddPrefixesInput;
