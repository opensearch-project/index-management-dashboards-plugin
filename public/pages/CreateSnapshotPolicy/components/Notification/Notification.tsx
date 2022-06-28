/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiFormRow, EuiSelect, EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
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
          <EuiFormRow>
            <EuiSelect
              id="channel-id"
              placeholder="Select channel ID"
              hasNoInitialSelection
              isLoading={loadingChannels}
              options={channels.map((channel) => ({ value: channel.config_id, text: channel.name }))}
              value={channelId}
              onChange={onChangeChannelId}
              data-test-subj="create-policy-notification-channel-id"
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
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton iconType="popout" href="notifications-dashboards#/channels" target="_blank">
            Manage channels
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default Notification;
