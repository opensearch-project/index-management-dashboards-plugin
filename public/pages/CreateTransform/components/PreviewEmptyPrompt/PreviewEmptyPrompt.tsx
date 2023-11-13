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
            <EuiText size="m">
              <h4> No fields selected </h4>
            </EuiText>
          }
          body={
            <p>
              {" "}
              From the table above, select a field you want to transform by clicking <EuiIcon type="plusInCircleFilled" /> next to the field
              name.
            </p>
          }
        />
      )}
    </EuiPanel>
  );
}
