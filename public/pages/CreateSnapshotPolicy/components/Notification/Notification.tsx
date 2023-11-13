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
