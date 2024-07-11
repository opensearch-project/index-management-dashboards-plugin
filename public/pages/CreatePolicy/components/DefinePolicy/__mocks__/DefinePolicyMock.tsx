/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import {
  EuiSpacer,
  EuiSmallButton,
  EuiTextArea,
  EuiText,
  // @ts-ignore
  EuiCopy,
} from "@elastic/eui";
import { ContentPanel } from "../../../../../components/ContentPanel";

interface DefinePolicyProps {
  jsonString: string;
  hasJSONError: boolean;
  onChange: (value: string) => void;
  onAutoIndent: () => void;
}

/*
 * Attempting to test EuiCodeEditor which uses react-ace was a lot more effort than seemed worthwhile
 * at the moment, so in the meantime we will mock DefinePolicy as a EuiTextArea so that we can still test
 * the functionality of CreatePolicy (minus the JSON code editor).
 * */
const DefinePolicy = ({ jsonString, onChange, onAutoIndent, hasJSONError }: DefinePolicyProps) => (
  <ContentPanel
    bodyStyles={{ padding: "initial" }}
    title="Define policy"
    titleSize="s"
    actions={[
      <EuiCopy textToCopy={jsonString}>
        {(copy: () => void) => (
          <EuiSmallButton iconType="copyClipboard" onClick={copy}>
            Copy
          </EuiSmallButton>
        )}
      </EuiCopy>,
      <EuiSmallButton iconType="editorAlignLeft" onClick={onAutoIndent} disabled={hasJSONError}>
        Auto Indent
      </EuiSmallButton>,
    ]}
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>Create a policy with a JSON configuration file. This can be added directly in the code editor below.</p>
      </EuiText>
    </div>
    <EuiSpacer size="s" />
    <EuiTextArea value={jsonString} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} aria-label="Code Editor" />
  </ContentPanel>
);

export default DefinePolicy;
