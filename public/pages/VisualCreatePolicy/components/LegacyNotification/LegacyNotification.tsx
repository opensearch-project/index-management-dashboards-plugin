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
        <EuiButton onClick={onSwitchToChannels}>Switch to using Channel ID</EuiButton>
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
