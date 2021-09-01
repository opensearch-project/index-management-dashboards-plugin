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
import { EuiFormRow, EuiCodeEditor } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DEFAULT_LEGACY_ERROR_NOTIFICATION } from "../../utils/constants";

interface LegacyNotificationProps {
  notificationJsonString: string;
  onChangeNotificationJsonString: (str: string) => void;
  actionNotification?: boolean;
}

const LegacyNotification = ({
  notificationJsonString,
  onChangeNotificationJsonString,
  actionNotification = false,
}: LegacyNotificationProps) => {
  return (
    <>
      <EuiFormRow isInvalid={false} error={null} style={{ maxWidth: "100%" }}>
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
