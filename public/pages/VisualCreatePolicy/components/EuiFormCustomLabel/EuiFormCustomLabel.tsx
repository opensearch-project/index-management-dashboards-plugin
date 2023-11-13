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

import React from "react";
import { EuiText } from "@elastic/eui";

interface EuiFormCustomLabelProps {
  title: string;
  helpText?: string;
  learnMore?: JSX.Element | null | undefined;
  textStyle?: object;
  headerStyle?: object;
  isInvalid?: boolean;
  isOptional?: boolean;
}

// New pattern for label and help text both being above the form row instead of label above and help below.
const EuiFormCustomLabel = ({
  title,
  helpText,
  learnMore = null,
  textStyle = { marginBottom: "5px" },
  headerStyle = { marginBottom: "2px" },
  isInvalid = false,
  isOptional = false,
}: EuiFormCustomLabelProps) => (
  <EuiText style={textStyle}>
    <h5 style={headerStyle} className={`euiFormLabel ${isInvalid ? "euiFormLabel-isInvalid" : ""}`}>
      {title}
      {isOptional ? (
        <React.Fragment>
          <span className="euiTextColor euiTextColor--subdued">
            <em>– optional</em>
          </span>
        </React.Fragment>
      ) : null}
    </h5>
    <p>
      {" "}
      {/* Keep the <p> tag even if no helpText to remove last child styling on h tags */}
      {helpText && (
        <span style={{ fontWeight: 200, fontSize: "12px" }}>
          {helpText} {learnMore}
        </span>
      )}
    </p>
  </EuiText>
);

export default EuiFormCustomLabel;
