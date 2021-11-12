/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiFormRow, EuiCodeEditor } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DEFAULT_LEGACY_ERROR_NOTIFICATION } from "../../utils/constants";

interface LegacyNotificationProps {
  notificationJsonString: string;
  onChangeNotificationJsonString: (str: string) => void;
  actionNotification?: boolean;
  isInvalid?: boolean;
}

const LegacyNotification = ({
  notificationJsonString,
  onChangeNotificationJsonString,
  actionNotification = false,
  isInvalid = false, // TODO: default to false for error notification for now, but add validation logic for it
}: LegacyNotificationProps) => {
  return (
    <>
      <EuiFormRow fullWidth isInvalid={isInvalid} error={null} style={{ maxWidth: "100%" }}>
        <DarkModeConsumer>
          {(isDarkMode) => (
            <EuiCodeEditor
              mode="json"
              placeholder={JSON.stringify(DEFAULT_LEGACY_ERROR_NOTIFICATION, null, 4)}
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
