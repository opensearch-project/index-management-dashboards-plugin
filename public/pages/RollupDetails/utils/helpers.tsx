/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RollupMetadata } from "../../../../models/interfaces";
import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from "@elastic/eui";

export const renderStatus = (metadata: RollupMetadata | undefined): JSX.Element => {
  if (metadata == null || metadata == undefined || metadata.rollup_metadata == null) return <dd>-</dd>;
  let icon;
  let iconColor;
  let textColor: "default" | "subdued" | "secondary" | "ghost" | "accent" | "warning" | "danger" | undefined;
  let text;
  switch (metadata.rollup_metadata.status) {
    case "failed":
      icon = "alert";
      iconColor = "danger";
      textColor = "danger";
      text = "Failed: " + metadata.rollup_metadata.failure_reason;
      break;
    case "finished":
      icon = "check";
      iconColor = "success";
      textColor = "secondary";
      text = "Complete";
      break;
    case "init":
      return (
        <EuiFlexGroup gutterSize="xs">
          <EuiFlexItem grow={false}>
            <EuiIcon size="s" type="clock" color="primary" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs" style={{ color: "#006BB4" }}>
              Initializing
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    case "started":
      icon = "play";
      iconColor = "success";
      textColor = "secondary";
      text = "Started";
      break;
    case "stopped":
      icon = "stop";
      iconColor = "subdued";
      textColor = "subdued";
      text = "Stopped";
      break;
    default:
      return <dd>-</dd>;
  }

  return (
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem grow={false}>
        <EuiIcon size="s" type={icon} color={iconColor} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size="xs" color={textColor}>
          {text}
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
