/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import { EuiFormRow, EuiCodeEditor, EuiCallOut, EuiButton, EuiSpacer } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";

interface LegacyNotificationProps {
  notificationJsonString: string;
  onChangeNotificationJsonString: (str: string) => void;
  onSwitchToChannels: () => void;
  actionNotification?: boolean;
}

const LegacyNotification = ({
  notificationJsonString,
  onChangeNotificationJsonString,
  onSwitchToChannels,
  actionNotification = false,
}: LegacyNotificationProps) => {
  return (
    <>
      <EuiCallOut title="Update your notifications to use Channel ID" iconType="iInCircle" size="s">
        <p>
          Using Channel ID will give you more control to manage notifications across OpenSearch dashboards. If you do decide to switch, you
          will lose your current error notification settings.
        </p>
        <EuiButton onClick={onSwitchToChannels}>Switch to using Channel ID</EuiButton>
      </EuiCallOut>
      <EuiSpacer size="m" />
      <EuiFormRow isInvalid={false} error={null} style={{ maxWidth: "100%" }}>
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
