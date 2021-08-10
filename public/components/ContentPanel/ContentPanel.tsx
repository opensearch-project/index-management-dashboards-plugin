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

/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle, EuiText } from "@elastic/eui";

interface ContentPanelProps {
  title?: string | JSX.Element;
  titleSize?: "xxxs" | "xxs" | "xs" | "s" | "m" | "l";
  subTitleText?: string | JSX.Element;
  bodyStyles?: object;
  panelStyles?: object;
  horizontalRuleClassName?: string;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}

const renderSubTitleText = (subTitleText: string | JSX.Element): JSX.Element | null => {
  if (typeof subTitleText === "string") {
    if (!subTitleText) return null;
    return (
      <EuiText size="s">
        <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>{subTitleText}</span>
      </EuiText>
    );
  }
  return subTitleText;
};

const ContentPanel: React.SFC<ContentPanelProps> = ({
  title = "",
  titleSize = "l",
  subTitleText = "",
  bodyStyles = {},
  panelStyles = {},
  horizontalRuleClassName = "",
  actions,
  children,
}) => (
  <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px", ...panelStyles }}>
    <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem>
        {typeof title === "string" ? (
          <EuiTitle size={titleSize}>
            <h3>{title}</h3>
          </EuiTitle>
        ) : (
          title
        )}
        {renderSubTitleText(subTitleText)}
      </EuiFlexItem>
      {actions ? (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {Array.isArray(actions) ? (
              (actions as React.ReactNode[]).map(
                (action: React.ReactNode, idx: number): React.ReactNode => <EuiFlexItem key={idx}>{action}</EuiFlexItem>
              )
            ) : (
              <EuiFlexItem>{actions}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    <EuiHorizontalRule margin="xs" className={horizontalRuleClassName} />

    <div style={{ padding: "0px 10px", ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

export default ContentPanel;
