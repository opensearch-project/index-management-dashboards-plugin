/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFormRow, EuiFieldText, EuiSpacer } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import CustomLabel from "../../../../components/CustomLabel";

interface RenameInputProps {
  getRenamePattern: (prefix: string) => void;
  getRenameReplacement: (prefix: string) => void;
}

const RenameInput = ({ getRenamePattern, getRenameReplacement }: RenameInputProps) => {
  const [renamePattern, setRenamePattern] = useState("");
  const [renameReplacement, setRenameReplacement] = useState("");

  const onPatternChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenamePattern(e.target.value);
    getRenamePattern(e.target.value);
  };

  const onReplacementChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenameReplacement(e.target.value);
    getRenameReplacement(e.target.value);
  };

  const patternHelpText =
    "Use regular expressiojn to define how index names will be renamed. By default, input (.+) to reuse the entire index name. [Learn more]";
  const replacementHelpText =
    "Define the format of renamed indices. Use $0 to include the entire matching index name, $1 to include the content of the first capture group, etc. [Learn more]";

  return (
    <>
      <EuiSpacer size="l" />

      <CustomLabel title="Rename Pattern" helpText={patternHelpText} />
      <EuiFormRow>
        <EuiFieldText value={renamePattern} onChange={onPatternChange} />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <CustomLabel title="Rename Replacement" helpText={replacementHelpText} />
      <EuiFormRow>
        <EuiFieldText value={renameReplacement} onChange={onReplacementChange} />
      </EuiFormRow>
    </>
  );
};

export default RenameInput;
