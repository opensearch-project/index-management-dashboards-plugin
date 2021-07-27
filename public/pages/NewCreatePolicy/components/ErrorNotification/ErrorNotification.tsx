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

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiTextArea, EuiSelect, EuiButton, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { ContentPanel } from "../../../../components/ContentPanel";
import "brace/theme/github";
import "brace/mode/json";

interface ErrorNotificationProps {
  channelId: string;
  channelIds: string[];
  message: string;
  onChangeChannelId: (value: ChangeEvent<HTMLSelectElement>) => void;
  onChangeMessage: (value: ChangeEvent<HTMLTextAreaElement>) => void;
}

const ErrorNotification = ({ channelId, channelIds, message, onChangeChannelId, onChangeMessage }: ErrorNotificationProps) => (
  <ContentPanel
    bodyStyles={{ padding: "initial" }}
    title={
      <EuiFlexGroup gutterSize="xs" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText>
            <h3>Error notification</h3>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiText color="subdued">
            <i> - optional</i>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    }
    titleSize="s"
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiFlexGroup style={{ maxWidth: 600 }} alignItems="center">
        <EuiFlexItem>
          <EuiFormRow label="Channel Id" helpText="Select a channel to notify." isInvalid={false} error={null}>
            <EuiSelect
              id="channel-id"
              hasNoInitialSelection
              options={channelIds.map((str) => ({ value: str, text: str }))}
              value={channelId}
              onChange={onChangeChannelId}
              data-test-subj="create-policy-error-notification-channel-id"
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {/* TODO: Change href to notification plugin route, and do we have a check if notification plugin is installed? */}
          <EuiButton iconType="popout" href="www.amazon.com" target="_blank">
            Manage channels
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      <EuiFormRow label="Message" helpText="Write a mustache template to send as a message. Learn more" isInvalid={false} error={null}>
        <EuiTextArea
          compressed={true}
          value={message}
          onChange={onChangeMessage}
          data-test-subj="create-policy-error-notification-message"
        />
      </EuiFormRow>
    </div>
  </ContentPanel>
);

export default ErrorNotification;
