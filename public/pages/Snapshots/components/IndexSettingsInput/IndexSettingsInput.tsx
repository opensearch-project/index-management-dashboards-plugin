/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFormRow, EuiText, EuiTextArea, EuiSpacer } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";

interface IndexSettingsInputProps {
  getIndexSettings: (indexSettings: string) => void;
  ignore: boolean;
}

const IndexSettingsInput = ({ getIndexSettings, ignore }: IndexSettingsInputProps) => {
  const [indexSettings, setIndexSettings] = useState("");

  const onSettingsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIndexSettings(e.target.value);
    getIndexSettings(e.target.value);
  };

  const title = ignore ? "Specify index settings to ignore" : "Specify custom index settings";
  const indexSettingsUrl = ignore
    ? "https://www.elastic.co/guide/en/elasticsearch/reference/7.10/restore-snapshot-api.html#restore-snapshot-api-ignore-index-settings"
    : "https://www.elastic.co/guide/en/elasticsearch/reference/7.10/restore-snapshot-api.html#restore-snapshot-api-index-settings";
  const helperText = ignore
    ? "Specify a comma-delimited list of settings to exclude from a snapshot."
    : "Specify a comma-delimited list of settings to override in all restored indices.";
  const placeholderText = ignore
    ? `Example: \nindex.refresh_interval,\nindex.max_script_fields `
    : `Example: \n {\n\"index.number_of_replicas\": 0,\n\"index.auto_expand_replicas\": true\n}`;

  return (
    <>
      <EuiSpacer size="m" />

      <EuiText size="xs">
        <h4>{title}</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          {helperText}
          <a href={indexSettingsUrl} target="_blank">
            [Learn more]
          </a>
        </p>
      </EuiText>
      <EuiFormRow>
        <EuiTextArea value={indexSettings} onChange={onSettingsChange} placeholder={placeholderText} />
      </EuiFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default IndexSettingsInput;
