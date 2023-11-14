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

import { EuiCallOut, EuiLink, EuiSpacer } from "@elastic/eui";
import React from "react";
import { ROUTES } from "../../utils/constants";
import { ActionType, OperationType, OperationTypeMapTitle } from "../../pages/Notifications/constant";
import { getPermissionValue } from "./hooks";

export interface INotificationCalloutProps {
  hasDefaultNotification: boolean;
  operationType?: OperationType;
  actionType: ActionType;
  permissionForViewLRON: boolean;
  permissionForCreateLRON: boolean;
}

export default function NotificationCallout(props: INotificationCalloutProps) {
  const { hasDefaultNotification, operationType, actionType, permissionForCreateLRON, permissionForViewLRON } = props;
  const permissionValue = getPermissionValue(permissionForViewLRON, permissionForCreateLRON, hasDefaultNotification);

  if (permissionValue === "110") {
    return null;
  }

  let title: React.ReactChild = <></>;
  switch (permissionValue) {
    case "000":
      title = (
        <>
          Your administrator may have set default notification settings for {OperationTypeMapTitle[operationType || actionType]} operations.
          Contact your administrator to request access.
        </>
      );
      break;
    case "010":
      title = (
        <>
          Your administrator may have set default notification settings for {OperationTypeMapTitle[operationType || actionType]} operations.
          You can send additional notifications for this operation.
        </>
      );
      break;
    case "100":
      title = (
        <>
          Your administrator has not set default notification settings for {OperationTypeMapTitle[operationType || actionType]} operations.
        </>
      );
      break;
    case "101":
      title = (
        <>
          Your administrator has set default notification settings for {OperationTypeMapTitle[operationType || actionType]} operations.
          Contact your administrator to request access.
        </>
      );
      break;
    case "111":
      title = (
        <>
          Default notification settings are set for {OperationTypeMapTitle[operationType || actionType]} operations. Configure default
          settings at{" "}
          <EuiLink style={{ textDecoration: "underline" }} href={`#${ROUTES.NOTIFICATIONS}`} target="_blank" external={false}>
            Notifications settings
          </EuiLink>
          .
        </>
      );
      break;
  }
  return (
    <>
      <EuiSpacer size="s" />
      <EuiCallOut color="primary" iconType="iInCircle" data-test-subj="defaultNotificationCallout" title={title} />
    </>
  );
}
