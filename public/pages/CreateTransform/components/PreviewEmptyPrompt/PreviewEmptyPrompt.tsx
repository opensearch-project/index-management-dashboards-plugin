/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiEmptyPrompt, EuiPanel, EuiText, EuiIcon } from "@elastic/eui";
import React from "react";

interface PreviewEmptyPromptProps {
  isReadOnly: boolean;
}

export default function PreviewEmptyPrompt({ isReadOnly }: PreviewEmptyPromptProps) {
  return (
    <EuiPanel>
      {isReadOnly ? (
        <EuiEmptyPrompt
          title={
            <EuiText size="m">
              <h4> No preview available </h4>
            </EuiText>
          }
        />
      ) : (
        <EuiEmptyPrompt
          title={
            <EuiText size="s">
              <h4> No fields selected </h4>
            </EuiText>
          }
          body={
            <EuiText size="s">
              <p>
                {" "}
                From the table above, select a field you want to transform by clicking <EuiIcon type="plusInCircleFilled" /> next to the
                field name.
              </p>
            </EuiText>
          }
        />
      )}
    </EuiPanel>
  );
}
