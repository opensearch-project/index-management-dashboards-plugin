/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  EuiSpacer,
  EuiSmallButton,
  // @ts-ignore
  EuiCodeEditor,
  EuiText,
  // @ts-ignore
  EuiCopy,
  EuiLink,
  EuiIcon,
  EuiPanel,
  EuiHorizontalRule,
  EuiFlexItem,
  EuiFlexGroup,
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
}

// TODO: Add custom autocomplete for Policy syntax
const DefinePolicy = ({ jsonString, onChange, onAutoIndent, hasJSONError }: DefinePolicyProps) => (
  <EuiPanel>
    <EuiFlexGroup justifyContent="spaceBetween" gutterSize="xs" alignItems="center">
      <EuiText size="s">
        <h2>{`Define policy`}</h2>
      </EuiText>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
          <EuiFlexItem>
            <EuiCopy textToCopy={jsonString}>
              {(copy: () => void) => (
                <EuiSmallButton iconType="copyClipboard" onClick={copy}>
                  Copy
                </EuiSmallButton>
              )}
            </EuiCopy>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSmallButton iconType="editorAlignLeft" onClick={onAutoIndent} disabled={hasJSONError}>
              Auto indent
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiHorizontalRule margin={"xs"} />
    <EuiText size="xs">
      <p>
        You can think of policies as state machines. "Actions" are the operations ISM performs when an index is in a certain state.
        "Transitions" define when to move from one state to another.{" "}
        <EuiLink href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
          Learn more
        </EuiLink>
      </p>
    </EuiText>
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
  </EuiPanel>
);

export default DefinePolicy;
