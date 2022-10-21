/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import _ from "lodash";
import { Toast } from "../../models/interfaces"
import { EuiHealth, EuiButton, EuiFlexGroup, EuiSpacer, EuiText } from "@elastic/eui";

export function truncateLongText(text: string, truncateLen: number = 20): string {
  if (text.length > truncateLen) {
    return text.slice(0, truncateLen) + "...";
  }
  return text;
}

export function truncateSpan(value: string, length: number = 20): React.ReactElement {
  const truncated = _.truncate(value, { length });
  return <span title={value}>{truncated}</span>;
}

export function snapshotStatusRender(value: string): React.ReactElement {
  const capital = _.capitalize(value);
  let color = "success";
  if (capital == "In_progress") color = "primary";
  if (capital == "Failed") color = "warning";
  if (capital == "Partial") color = "danger";

  return <EuiHealth color={color}>{capital}</EuiHealth>;
}


export const getToasts = (id: string, message: string | undefined, snapshotId: string, onClick: (e: React.MouseEvent) => void): Toast[] => {
  const toasts = [
    {
      id: "success_restore_toast",
      title: `Restore from snapshot "${snapshotId}" is in progress.`,
      iconType: "check",
      color: "success",
      text: (
        <>
          <EuiSpacer size="xl" />
          <EuiFlexGroup justifyContent="flexEnd" style={{ paddingRight: "1rem" }}>
            <EuiButton onClick={onClick}>View restore activities</EuiButton>
          </EuiFlexGroup>
        </>
      )
    },
    {
      id: "error_restore_toast",
      title: `Failed to restore snapshot "${snapshotId}"`,
      color: "danger",
      text: (
        <>
          <EuiText size="s">{message}</EuiText>
          <EuiSpacer size="xl" />
          <EuiFlexGroup justifyContent="flexEnd" style={{ paddingRight: "1rem" }}>
            <EuiButton onClick={onClick} color="danger">View full error</EuiButton>
          </EuiFlexGroup>
        </>
      )
    }
  ]

  return id === "success_restore_toast" ? [toasts[0]] : [toasts[1]];
}
