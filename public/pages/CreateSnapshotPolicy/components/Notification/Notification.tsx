/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCompressedSelect, EuiSmallButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { FeatureChannelList } from "../../../../../server/models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";

interface NotificationProps {
  channelId: string;
  channels: FeatureChannelList[];
  loadingChannels: boolean;
  onChangeChannelId: (value: ChangeEvent<HTMLSelectElement>) => void;
  getChannels: () => void;
}

const Notification = ({ channelId, channels, loadingChannels, onChangeChannelId, getChannels }: NotificationProps) => {
  return (
    <>
      <CustomLabel title="Select notification channels" />
      <EuiFlexGroup gutterSize="s" style={{ maxWidth: 600 }}>
        <EuiFlexItem>
          <EuiCompressedFormRow>
            <EuiCompressedSelect
              id="channel-id"
              placeholder="Select channel ID"
              hasNoInitialSelection
              isLoading={loadingChannels}
              options={channels.map((channel) => ({ value: channel.config_id, text: channel.name }))}
              value={channelId}
              onChange={onChangeChannelId}
              data-test-subj="create-policy-notification-channel-id"
            />
          </EuiCompressedFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            iconType="refresh"
            onClick={getChannels}
            disabled={loadingChannels}
            className="refresh-button"
            data-test-subj="channel-notification-refresh"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton iconType="popout" href="notifications-dashboards#/channels" target="_blank" iconSide="right">
            Manage channels
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default Notification;
