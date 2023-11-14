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

import React, { ChangeEvent } from "react";
import { EuiSpacer, EuiFormRow, EuiTextArea, EuiSelect, EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { FeatureChannelList } from "../../../server/models/interfaces";
import CustomFormRow from "../CustomFormRow";

interface ChannelNotificationProps {
  channelId: string;
  channels: FeatureChannelList[];
  loadingChannels: boolean;
  message?: string;
  onChangeChannelId: (value: ChangeEvent<HTMLSelectElement>) => void;
  onChangeMessage?: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  getChannels: () => void;
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
  actionNotification = false,
}: ChannelNotificationProps) => {
  return (
    <>
      <CustomFormRow label="Channel ID">
        <EuiFlexGroup gutterSize="s" style={{ maxWidth: 600, width: 600 }}>
          <EuiFlexItem>
            <EuiSelect
              id={actionNotification ? "action-channel-id" : "channel-id"}
              placeholder="Select channel ID"
              hasNoInitialSelection
              isLoading={loadingChannels}
              options={channels.map((channel) => ({ value: channel.config_id, text: channel.name }))}
              value={channelId}
              onChange={onChangeChannelId}
              data-test-subj={actionNotification ? "create-policy-notification-action-channel-id" : "create-policy-notification-channel-id"}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              iconType="refresh"
              onClick={getChannels}
              disabled={loadingChannels}
              className="refresh-button"
              data-test-subj="channel-notification-refresh"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton iconType="popout" href="notifications-dashboards#/channels" target="_blank">
              Manage channels
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </CustomFormRow>

      {!!channelId && (
        <>
          <EuiSpacer size="m" />

          <EuiFormRow title="Notification message" helpText="Embed variables in your message using Mustache template.">
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
