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
import { EuiFormRow, EuiCallOut, EuiButton, EuiSpacer } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../components/DarkMode";
import JSONEditor from "../../components/JSONEditor";

interface LegacyNotificationProps {
  value: Record<string, any>;
  onChange: (val: LegacyNotificationProps["value"]) => void;
  onSwitchToChannels: () => void;
  actionNotification?: boolean;
}

const LegacyNotification = ({ value, onChange, onSwitchToChannels }: LegacyNotificationProps) => {
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
      <EuiFormRow fullWidth style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <JSONEditor
              theme={isDarkMode ? "sense-dark" : "github"}
              width="100%"
              value={JSON.stringify(value, null, 2)}
              onChange={(val) => onChange(JSON.parse(val))}
              setOptions={{ fontSize: "14px" }}
              aria-label="Code Editor"
              height="300px"
            />
          )}
        </DarkModeConsumer>
      </EuiFormRow>
    </>
  );
};

export default LegacyNotification;
