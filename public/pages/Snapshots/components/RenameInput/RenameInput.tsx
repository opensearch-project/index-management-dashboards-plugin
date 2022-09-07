/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFormRow, EuiFieldText, EuiSpacer, EuiText } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
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

  const renamePatternUrl =
    "https://www.elastic.co/guide/en/elasticsearch/reference/7.10/restore-snapshot-api.html#restore-snapshot-api-rename-pattern";
  const renameReplacementUrl =
    "https://www.elastic.co/guide/en/elasticsearch/reference/7.10/restore-snapshot-api.html#restore-snapshot-api-rename-replacement";

  return (
    <>
      <EuiSpacer size="l" />

      <EuiText size="xs">
        <h4>Rename Pattern</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Use regular expression to define how index names will be renamed.
          <br />
          By default, input (.+) to reuse the entire index name.{" "}
          <a href={renamePatternUrl} target="_blank">
            [Learn more]
          </a>
        </p>
      </EuiText>
      <EuiFormRow>
        <EuiFieldText value={renamePattern} onChange={onPatternChange} placeholder="Example: (.+)" />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiText size="xs">
        <h4>Rename Replacement</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Define the format of renamed indices. Use $0 to include the
          <br />
          entire matching index name, $1 to include the content of the first
          <br />
          capture group, etc.{" "}
          <a href={renameReplacementUrl} target="_blank">
            [Learn more]
          </a>
        </p>
      </EuiText>
      <EuiFormRow>
        <EuiFieldText value={renameReplacement} onChange={onReplacementChange} placeholder="Example: restored_$1" />
      </EuiFormRow>
    </>
  );
};

export default RenameInput;
