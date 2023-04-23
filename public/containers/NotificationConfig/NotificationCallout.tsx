import { EuiCallOut, EuiLink, EuiSpacer } from "@elastic/eui";
import React from "react";
import { ROUTES } from "../../utils/constants";
import { ActionType, OperationType, OperationTypeMapTitle } from "../../pages/Notifications/constant";

export default function NotificationCallout(props: {
  hasDefaultNotification: boolean;
  operationType?: OperationType;
  actionType: ActionType;
  permissionForViewLRON: boolean;
  permissionForCreateLRON: boolean;
}) {
  const { hasDefaultNotification, operationType, actionType, permissionForCreateLRON, permissionForViewLRON } = props;
  if (!hasDefaultNotification && permissionForViewLRON) {
    return null;
  }
  return (
    <>
      <EuiSpacer size="s" />
      <EuiCallOut
        color="primary"
        iconType="iInCircle"
        title={
          <>
            {hasDefaultNotification ? (
              <>
                Your administrator has set default notification settings for {OperationTypeMapTitle[operationType || actionType]}{" "}
                operations.{" "}
                {permissionForCreateLRON ? (
                  <>
                    Configure default settings at{" "}
                    <EuiLink style={{ textDecoration: "underline" }} href={`#${ROUTES.NOTIFICATIONS}`} target="_blank" external={false}>
                      Notifications
                    </EuiLink>
                    .
                  </>
                ) : (
                  <>Contact your administrator to request access to notification settings.</>
                )}
              </>
            ) : permissionForCreateLRON ? (
              <>
                Your administrator may have set default notification settings for {OperationTypeMapTitle[operationType || actionType]}{" "}
                operations. You can send additional notifications for this operation.
              </>
            ) : permissionForViewLRON ? (
              <>
                Your administrator has not set default notification settings for {OperationTypeMapTitle[operationType || actionType]}{" "}
                operations.
              </>
            ) : (
              <>
                Your administrator may have set default notification settings for {OperationTypeMapTitle[operationType || actionType]}{" "}
                operations. Contact your administrator to request access to notification settings.
              </>
            )}
          </>
        }
      />
    </>
  );
}
