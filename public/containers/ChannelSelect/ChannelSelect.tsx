/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useChannels } from "./hooks";
import { AllBuiltInComponents } from "../../components/FormGenerator";
import "./index.scss";

export interface ChannelSelectProps {
  value?: { id: string }[];
  onChange: (val: { id: string }[]) => void;
  "data-test-subj"?: string;
}

const ChannelSelect = (props: ChannelSelectProps) => {
  const { value, onChange } = props;
  const { channels, loading } = useChannels();
  return (
    <EuiFlexGroup data-test-subj={props["data-test-subj"]} gutterSize="s" style={{ maxWidth: "unset", minWidth: 300 }}>
      <EuiFlexItem>
        <AllBuiltInComponents.ComboBoxMultiple
          className="channelSelect-combobox"
          placeholder="Select channel"
          isLoading={loading}
          options={channels.map((channel) => ({ value: channel.config_id, label: channel.name, className: "valid-option" }))}
          onChange={(val, options: EuiComboBoxOptionOption<string>[]) => {
            onChange(
              options.map((item) => ({
                id: item.value || "",
              }))
            );
          }}
          onCreateOption={undefined}
          value={loading ? [] : value?.map((item) => item.id)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ChannelSelect;
