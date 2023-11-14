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

const ContentPanel: React.FC<ContentPanelProps> = ({
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
