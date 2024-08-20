/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiAccordion,
  htmlIdGenerator,
  EuiTextColor,
} from "@elastic/eui";

export interface ContentPanelProps {
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
  accordion?: boolean;
}

const renderSubTitleText = (subTitleText: string | JSX.Element): JSX.Element | null => {
  if (typeof subTitleText === "string") {
    if (!subTitleText) return null;
    return (
      <EuiText size="xs">
        <EuiTextColor color="subdued">{subTitleText}</EuiTextColor>
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
  accordion,
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState<"open" | "closed">("closed");
  const toggleAccordion = (isOpen: boolean) => {
    setIsAccordionOpen(isOpen ? "open" : "closed");
  };
  const isGhost = color === "ghost";
  const titleContent = (
    <EuiFlexGroup
      style={{ ...(noExtraPadding ? { marginTop: 0, marginBottom: 0 } : {}), padding: isGhost || accordion ? undefined : "0px 10px" }}
      justifyContent="spaceBetween"
      alignItems="flexStart"
    >
      {title ? (
        <EuiFlexItem>
          {typeof title === "string" ? (
            <EuiTitle size={titleSize}>
              <h1>
                {title}
                <span className="panel-header-count"> {itemCount > 0 ? `(${itemCount})` : null} </span>
              </h1>
            </EuiTitle>
          ) : (
            title
          )}
          {renderSubTitleText(subTitleText)}
        </EuiFlexItem>
      ) : null}
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
  );
  const content = (
    <>
      {accordion ? (
        <EuiAccordion id={htmlIdGenerator()()} forceState={isAccordionOpen} onToggle={toggleAccordion} buttonContent={titleContent}>
          <></>
        </EuiAccordion>
      ) : (
        titleContent
      )}
      {isGhost ? null : <EuiHorizontalRule margin={noExtraPadding ? "none" : "xs"} className={horizontalRuleClassName} />}
      {children ? (
        <div
          style={{
            padding: isGhost ? undefined : "0px 10px",
            ...bodyStyles,
            display: accordion && isAccordionOpen === "closed" ? "none" : undefined,
          }}
        >
          {children}
        </div>
      ) : null}
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
