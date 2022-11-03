/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFormRow, EuiFieldText, EuiSpacer, EuiText, EuiLink } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import { RESTORE_SNAPSHOT_DOCUMENTATION_URL } from "../../../../utils/constants"
interface RenameInputProps {
  getRenamePattern: (prefix: string) => void;
  getRenameReplacement: (prefix: string) => void;
  showPatternError: boolean;
  showRenameError: boolean
}

const RenameInput = ({ getRenamePattern, getRenameReplacement, showPatternError, showRenameError }: RenameInputProps) => {
  const [renamePattern, setRenamePattern] = useState("(.+)");
  const [renameReplacement, setRenameReplacement] = useState("restored_$1");
  const badRenamePattern = "Please enter a valid Rename pattern.";
  const badRenameReplacement = "Please enter a valid Rename replacement."

  const onPatternChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenamePattern(e.target.value);
    getRenamePattern(e.target.value);
  };

  const onReplacementChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenameReplacement(e.target.value);
    getRenameReplacement(e.target.value);
  };
  const patternText = `Define the format of renamed indices. Use $0 to include the \n
  entire matching index name, $1 to include the content of the first\n
  capture group, etc.`;

  const renameText = `Define the format of renamed indices. Use $0 to include the\n
  entire matching index name, $1 to include the content of the first\n
  capture group, etc.`;

  const patternLabel = (
    <>
      <EuiText size="xs">
        <h4>Rename Pattern</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px", fontWeight: "200" }}>
        {patternText}{" "}
        <EuiLink href={RESTORE_SNAPSHOT_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer" external={true}>
          Learn more
        </EuiLink>
      </EuiText>
    </>
  );

  const renameLabel = (
    <>
      <EuiText size="xs">
        <h4>Rename Replacement</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px", fontWeight: "200" }}>
        {renameText}{" "}
        <EuiLink href={RESTORE_SNAPSHOT_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer" external={true}>
          Learn more
        </EuiLink>
      </EuiText>
    </>
  );

  return (
    <>
      <EuiSpacer size="l" />
      <EuiFormRow error={badRenamePattern} isInvalid={showPatternError} label={patternLabel} >
        <EuiFieldText value={renamePattern} onChange={onPatternChange} isInvalid={showPatternError} data-test-subj="renamePatternInput" />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow error={badRenameReplacement} isInvalid={showRenameError} label={renameLabel}>
        <EuiFieldText value={renameReplacement} onChange={onReplacementChange} isInvalid={showRenameError} data-test-subj="renameReplacementInput" />
      </EuiFormRow>
    </>
  );
};

export default RenameInput;
