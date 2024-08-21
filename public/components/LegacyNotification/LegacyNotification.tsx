/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiCompressedFormRow, EuiCallOut, EuiSmallButton, EuiSpacer } from "@elastic/eui";
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
        <EuiSmallButton onClick={onSwitchToChannels}>Switch to using Channel ID</EuiSmallButton>
      </EuiCallOut>
      <EuiSpacer size="m" />
      <EuiCompressedFormRow fullWidth style={{ maxWidth: "100%" }}>
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
      </EuiCompressedFormRow>
    </>
  );
};

export default LegacyNotification;
