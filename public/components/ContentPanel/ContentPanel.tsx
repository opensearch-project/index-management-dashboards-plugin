/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle, EuiText, EuiSpacer } from "@elastic/eui";

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
  color?: "ghost";
  noExtraPadding?: boolean;
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
  color,
  noExtraPadding,
}) => {
  const isGhost = color === "ghost";
  const content = (
    <>
      <EuiFlexGroup
        style={{ ...(noExtraPadding ? { marginTop: 0, marginBottom: 0 } : {}), padding: isGhost ? undefined : "0px 10px" }}
        justifyContent="spaceBetween"
        alignItems="flexStart"
      >
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
      {isGhost ? null : <EuiHorizontalRule margin={noExtraPadding ? "none" : "xs"} className={horizontalRuleClassName} />}
      {children && <div style={{ padding: isGhost ? undefined : "0px 10px", ...bodyStyles }}>{children}</div>}
    </>
  );

  if (isGhost) {
    return content;
  }

  return (
    <EuiPanel
      style={{ ...(noExtraPadding ? { paddingTop: 0, paddingBottom: 0 } : {}), paddingLeft: "0px", paddingRight: "0px", ...panelStyles }}
    >
      {content}
    </EuiPanel>
  );
};

export default ContentPanel;
