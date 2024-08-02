/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import _ from "lodash";
import { Toast } from "../../models/interfaces";
import { EuiHealth, EuiSmallButton, EuiFlexGroup, EuiSpacer, EuiText } from "@elastic/eui";

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
            <EuiSmallButton onClick={onClick}>View restore activities</EuiSmallButton>
          </EuiFlexGroup>
        </>
      ),
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
            <EuiSmallButton onClick={onClick} color="danger">
              View full error
            </EuiSmallButton>
          </EuiFlexGroup>
        </>
      ),
    },
  ];
  if (id === "success_restore_toast") {
    return [toasts[0]];
  }
  return [toasts[1]];
};

interface CheckboxLabelProps {
  title: string;
  helpText: string;
}

export const CheckBoxLabel = ({ title, helpText }: CheckboxLabelProps) => (
  <>
    <EuiText size="s">{title}</EuiText>
    <EuiText size="xs" style={{ fontWeight: "200" }}>
      {helpText}
    </EuiText>
  </>
);

export const checkBadJSON = (testString: string) => {
  try {
    JSON.parse(testString);
    return false;
  } catch (err) {
    return true;
  }
};

export const checkNoSelectedIndices = (indices: string, restoreSpecific: boolean): boolean => {
  let notSelected = false;

  if (restoreSpecific && indices.length === 0) {
    notSelected = true;
  }

  return notSelected;
};

export const checkBadRegex = (regex: string): boolean => {
  try {
    new RegExp(regex);

    return false;
  } catch (err) {
    return true;
  }
};

export const checkBadReplacement = (regexString: string): boolean => {
  const isNotValid = regexString.indexOf("$") >= 0;

  if (isNotValid) return false;

  return true;
};

export const checkCustomIgnoreConflict = (customIndexSettings?: string, ignoreIndexSettings?: string) => {
  if (customIndexSettings && customIndexSettings.length > 0) {
    const customSettingsBad = checkBadJSON(customIndexSettings);

    if (customSettingsBad) {
      return false;
    }

    const customSettings = JSON.parse(customIndexSettings);

    for (let setting in customSettings) {
      if (ignoreIndexSettings && ignoreIndexSettings.indexOf(setting) >= 0) {
        return true;
      }
    }
  }
  return false;
};
