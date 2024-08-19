/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiSpacer,
  EuiButton,
  // @ts-ignore
  EuiCodeEditor,
  EuiText,
  // @ts-ignore
  EuiCopy,
  EuiLink,
  EuiIcon,
} from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DOCUMENTATION_URL } from "../../../../utils/constants";

interface DefinePolicyProps {
  jsonString: string;
  hasJSONError: boolean;
  onChange: (value: string) => void;
  onAutoIndent: () => void;
  useNewUx?: boolean;
}

// TODO: Add custom autocomplete for Policy syntax
const DefinePolicy = ({ jsonString, onChange, onAutoIndent, hasJSONError, useNewUx }: DefinePolicyProps) => (
  <ContentPanel
    bodyStyles={{ padding: "initial" }}
    title="Define policy"
    titleSize="s"
    actions={[
      <EuiCopy textToCopy={jsonString}>
        {(copy: () => void) => (
          <EuiButton iconType="copyClipboard" onClick={copy} size={useNewUx ? "s" : undefined}>
            Copy
          </EuiButton>
        )}
      </EuiCopy>,
      <EuiButton iconType="editorAlignLeft" onClick={onAutoIndent} disabled={hasJSONError} size={useNewUx ? "s" : undefined}>
        Auto indent
      </EuiButton>,
    ]}
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>
          You can think of policies as state machines. "Actions" are the operations ISM performs when an index is in a certain state.
          "Transitions" define when to move from one state to another.{" "}
          <EuiLink href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    </div>
    <EuiSpacer size="m" />
    <DarkModeConsumer>
      {(isDarkMode) => (
        <EuiCodeEditor
          mode="json"
          theme={isDarkMode ? "sense-dark" : "github"}
          width="100%"
          value={jsonString}
          onChange={onChange}
          setOptions={{ fontSize: "14px" }}
          aria-label="Code Editor"
        />
      )}
    </DarkModeConsumer>
  </ContentPanel>
);

export default DefinePolicy;
