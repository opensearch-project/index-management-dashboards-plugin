/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiTextArea, EuiSelect, EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { FeatureChannelList } from "../../../../../server/models/interfaces";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

interface ChannelNotificationProps {
  channelId: string;
  channels: FeatureChannelList[];
  loadingChannels: boolean;
  message?: string;
  onChangeChannelId: (value: ChangeEvent<HTMLSelectElement>) => void;
  onChangeMessage?: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  getChannels: () => void;
  useNewUx?: boolean;
  actionNotification?: boolean; // to tell if this is rendering in actions or in error notification as they both show up on page together
}

const ChannelNotification = ({
  channelId,
  channels,
  loadingChannels,
  message,
  onChangeChannelId,
  onChangeMessage,
  getChannels,
  useNewUx,
  actionNotification = false,
}: ChannelNotificationProps) => {
  return (
    <>
      <EuiFormCustomLabel title="Channel ID" />
      <EuiFlexGroup gutterSize="s" style={{ maxWidth: 600 }}>
        <EuiFlexItem>
          <EuiFormRow>
            <EuiSelect
              compressed={useNewUx}
              id={actionNotification ? "action-channel-id" : "channel-id"}
              placeholder="Select channel ID"
              hasNoInitialSelection
              isLoading={loadingChannels}
              options={channels.map((channel) => ({ value: channel.config_id, text: channel.name }))}
              value={channelId}
              onChange={onChangeChannelId}
              data-test-subj={actionNotification ? "create-policy-notification-action-channel-id" : "create-policy-notification-channel-id"}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            iconType="refresh"
            onClick={getChannels}
            disabled={loadingChannels}
            className="refresh-button"
            data-test-subj="channel-notification-refresh"
            size={useNewUx ? "s" : undefined}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton iconType="popout" href="notifications-dashboards#/channels" target="_blank" size={useNewUx ? "s" : undefined}>
            Manage channels
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      {!!channelId && (
        <>
          <EuiSpacer size="m" />

          <EuiFormCustomLabel title="Notification message" helpText="Embed variables in your message using Mustache template." />

          <EuiFormRow>
            <EuiTextArea
              placeholder="The index {{ctx.index}} failed during policy execution."
              style={{ minHeight: "150px" }}
              compressed={true}
              value={message}
              onChange={onChangeMessage}
              data-test-subj={actionNotification ? "create-policy-notification-action-message" : "create-policy-notification-message"}
            />
          </EuiFormRow>
        </>
      )}
    </>
  );
};

export default ChannelNotification;
