/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { EuiEmptyPrompt, EuiPanel, EuiText } from "@elastic/eui";
import React from "react";
import { TransformAggItem } from "../../../../../models/interfaces";

interface PreviewEmptyPromptProps {
  isReadOnly: boolean;
}

export default function PreviewEmptyPrompt({ isReadOnly }: PreviewEmptyPromptProps) {
  return (
    <EuiPanel>
      <EuiEmptyPrompt
        title={
          <EuiText size="m">
            <h4> No fields selected</h4>
          </EuiText>
        }
        body={
          isReadOnly ? (
            <p>No preview available</p>
          ) : (
            <p>From the table above, select a field you want to transform by clicking the “plus” button next to the field name</p>
          )
        }
      />
    </EuiPanel>
  );
}
