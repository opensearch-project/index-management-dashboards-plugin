/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFormRow, EuiFieldText, EuiSpacer, EuiText, EuiLink } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import { RESTORE_SNAPSHOT_DOCUMENTATION_URL } from "../../../../utils/constants";
import { BAD_RENAME_PATTERN_TEXT, BAD_RENAME_REPLACEMENT_TEXT, RENAME_HELP_TEXT, PATTERN_HELP_TEXT } from "../../constants";
interface RenameInputProps {
  getRenamePattern: (prefix: string) => void;
  getRenameReplacement: (prefix: string) => void;
  showPatternError: boolean;
  showRenameError: boolean;
}

const RenameInput = ({ getRenamePattern, getRenameReplacement, showPatternError, showRenameError }: RenameInputProps) => {
  const [renamePattern, setRenamePattern] = useState("(.+)");
  const [renameReplacement, setRenameReplacement] = useState("restored_$1");

  const onPatternChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenamePattern(e.target.value);
    getRenamePattern(e.target.value);
  };

  const onReplacementChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRenameReplacement(e.target.value);
    getRenameReplacement(e.target.value);
  };

  const patternLabel = (
    <>
      <EuiText size="xs">
        <h4>Rename Pattern</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px", fontWeight: "200" }}>
        {`${PATTERN_HELP_TEXT}} `}
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
        {`${RENAME_HELP_TEXT} `}
        <EuiLink href={RESTORE_SNAPSHOT_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer" external={true}>
          Learn more
        </EuiLink>
      </EuiText>
    </>
  );

  return (
    <>
      <EuiSpacer size="l" />
      <EuiCompressedFormRow error={BAD_RENAME_PATTERN_TEXT} isInvalid={showPatternError} label={patternLabel} id="rename_pattern">
        <EuiFieldText value={renamePattern} onChange={onPatternChange} isInvalid={showPatternError} data-test-subj="renamePatternInput" />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />

      <EuiCompressedFormRow error={BAD_RENAME_REPLACEMENT_TEXT} isInvalid={showRenameError} label={renameLabel} id="rename_replacement">
        <EuiFieldText
          value={renameReplacement}
          onChange={onReplacementChange}
          isInvalid={showRenameError}
          data-test-subj="renameReplacementInput"
        />
      </EuiCompressedFormRow>
    </>
  );
};

export default RenameInput;
