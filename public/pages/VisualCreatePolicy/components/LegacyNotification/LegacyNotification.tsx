/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFormRow, EuiCodeEditor, EuiCallOut, EuiSmallButton, EuiSpacer } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";

interface LegacyNotificationProps {
  notificationJsonString: string;
  onChangeNotificationJsonString: (str: string) => void;
  onSwitchToChannels: () => void;
  actionNotification?: boolean;
  isInvalid?: boolean;
}

const LegacyNotification = ({
  notificationJsonString,
  onChangeNotificationJsonString,
  onSwitchToChannels,
  actionNotification = false,
  isInvalid = false, // TODO: default to false for error notification for now, but add validation logic for it
}: LegacyNotificationProps) => {
  return (
    <>
      <EuiCallOut title="Update your notifications to use Channel ID" iconType="iInCircle" size="s">
        <p>
          Using Channel ID will give you more control to manage notifications across OpenSearch dashboards. If you do decide to switch, you
          will lose your current error notification settings.
        </p>
        <EuiSmallButton onClick={onSwitchToChannels}>Switch to using Channel ID</EuiSmallButton>
      </EuiCallOut>
      <EuiSpacer size="m" />
      <EuiFormRow fullWidth isInvalid={isInvalid} error={null} style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <EuiCodeEditor
              mode="json"
              theme={isDarkMode ? "sense-dark" : "github"}
              width="100%"
              value={notificationJsonString}
              onChange={onChangeNotificationJsonString}
              setOptions={{ fontSize: "14px" }}
              aria-label="Code Editor"
              height="300px"
              data-test-subj={actionNotification ? "create-policy-action-legacy-notification" : "create-policy-legacy-notification"}
            />
          )}
        </DarkModeConsumer>
      </EuiFormRow>
    </>
  );
};

export default LegacyNotification;
