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

import { EuiFormRow, EuiText, EuiTextArea, EuiSpacer, EuiLink } from "@elastic/eui";
import React, { useState, ChangeEvent } from "react";
import { INDEX_SETTINGS_URL } from "../../../../utils/constants";

interface IndexSettingsInputProps {
  getIndexSettings: (indexSettings: string, ignore: boolean) => void;
  showError: boolean;
  inputError: string;
  ignore: boolean;
}

const IndexSettingsInput = ({ getIndexSettings, ignore, showError, inputError }: IndexSettingsInputProps) => {
  const [indexSettings, setIndexSettings] = useState("");

  const onSettingsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIndexSettings(e.target.value);
    getIndexSettings(e.target.value, ignore);
  };

  const title = ignore ? "Specify index settings to ignore" : "Specify custom index settings";
  const helperText = ignore
    ? "Specify a comma-delimited list of settings to exclude from a snapshot."
    : "Specify a comma-delimited list of settings to override in all restored indices.";
  const placeholderText = ignore
    ? `Example: \nindex.refresh_interval,\nindex.max_script_fields `
    : `Example: \n {\n\"index.number_of_replicas\": 0,\n\"index.auto_expand_replicas\": true\n}`;

  const indexSettingsLabel = (
    <>
      <EuiText size="xs">
        <h4>{title}</h4>
      </EuiText>
      <EuiText size="xs" style={{ padding: "0px 0px 5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          {`${helperText} `}
          <EuiLink href={INDEX_SETTINGS_URL} target="_blank" external={true} rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    </>
  );

  return (
    <>
      <EuiSpacer size="m" />

      <EuiFormRow
        isInvalid={showError}
        error={inputError}
        label={indexSettingsLabel}
        id={ignore ? "ignore_index_settings" : "customize_index_settings"}
      >
        <EuiTextArea value={indexSettings} onChange={onSettingsChange} placeholder={placeholderText} isInvalid={showError} />
      </EuiFormRow>

      <EuiSpacer size="m" />
    </>
  );
};

export default IndexSettingsInput;
