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
  <div>
    <EuiText style={textStyle} size="s">
      <h3 style={headerStyle} className={`euiFormLabel ${isInvalid ? "euiFormLabel-isInvalid" : ""}`}>
        {title}
        {isOptional ? (
          <React.Fragment>
            <span className="euiTextColor euiTextColor--subdued">
              <em>– optional</em>
            </span>
          </React.Fragment>
        ) : null}
      </h3>
    </EuiText>
    <EuiText style={textStyle} size="xs">
      <p>
        {" "}
        {/* Keep the <p> tag even if no helpText to remove last child styling on h tags */}
        {helpText && (
          <span style={{ fontWeight: 300, fontSize: "14px" }}>
            {helpText} {learnMore}
          </span>
        )}
      </p>
    </EuiText>
  </div>
);

export default EuiFormCustomLabel;
