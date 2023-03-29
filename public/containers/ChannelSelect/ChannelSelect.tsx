/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useChannels } from "./hooks";
import { AllBuiltInComponents } from "../../components/FormGenerator";

interface ChannelNotificationProps {
  value?: string[];
  onChange: (value: ChangeEvent<HTMLSelectElement>) => void;
}

const ChannelSelect = ({ value, onChange }: ChannelNotificationProps) => {
  const { channels, loading } = useChannels();
  return (
    <EuiFlexGroup gutterSize="s" style={{ maxWidth: "unset", minWidth: 300 }}>
      <EuiFlexItem>
        <AllBuiltInComponents.ComboBoxMultiple
          placeholder="Select channel"
          isLoading={loading}
          options={channels.map((channel) => ({ value: channel.config_id, label: channel.name }))}
          onChange={onChange}
          value={value}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ChannelSelect;
