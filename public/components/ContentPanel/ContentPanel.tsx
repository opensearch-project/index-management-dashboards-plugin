/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
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
  itemCount?: number;
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
  itemCount = 0,
}) => (
  <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px", ...panelStyles }}>
    <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="flexStart">
      <EuiFlexItem>
        {typeof title === "string" ? (
          <EuiTitle size={titleSize}>
            <h3>
              {title}
              <span className="panel-header-count"> {itemCount > 0 ? `(${itemCount})` : null} </span>
            </h3>
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

    {children && <div style={{ padding: "0px 10px", ...bodyStyles }}>{children}</div>}
  </EuiPanel>
);

export default ContentPanel;
