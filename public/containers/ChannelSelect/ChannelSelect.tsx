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

import React from "react";
import { EuiComboBoxOptionOption, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useChannels } from "./hooks";
import { AllBuiltInComponents } from "../../components/FormGenerator";
import "./index.scss";

export interface ChannelSelectProps {
  value?: Array<{ id: string }>;
  onChange: (val: Array<{ id: string }>) => void;
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
          onChange={(val, options: Array<EuiComboBoxOptionOption<string>>) => {
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
