/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import _ from "lodash";
import { Toast } from "../../models/interfaces"
import { EuiHealth, EuiButton, EuiFlexGroup, EuiSpacer } from "@elastic/eui";

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


export const getToasts = (toastId: string, snapshotId: string, repository: string, onClick: (e: React.MouseEvent) => void): Toast[] => {
  return [
    {
      id: toastId,
      title: `Restored snapshot ${snapshotId} to repository ${repository}.`,
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
    }
  ]
}
