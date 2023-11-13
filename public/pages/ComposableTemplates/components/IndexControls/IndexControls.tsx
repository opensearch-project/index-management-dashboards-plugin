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

import React, { useEffect, useState } from "react";
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import FilterGroup from "../../../../components/FilterGroup";
import { IndicesUpdateMode } from "../../../../utils/constants";

export interface SearchControlsProps {
  value: {
    search: string;
    selectedTypes: string[];
  };
  onSearchChange: (args: SearchControlsProps["value"]) => void;
}

export default function SearchControls(props: SearchControlsProps) {
  const [state, setState] = useState<SearchControlsProps["value"]>(props.value);
  const onChange = <T extends keyof SearchControlsProps["value"]>(field: T, value: SearchControlsProps["value"][T]) => {
    const payload = {
      ...state,
      [field]: value,
    };
    setState(payload);
    props.onSearchChange(payload);
  };
  useEffect(() => {
    setState(props.value);
  }, [props.value]);
  return (
    <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiFieldSearch fullWidth placeholder="Search..." value={state.search} onChange={(e) => onChange("search", e.target.value)} />
      </EuiFlexItem>
      <EuiFlexItem style={{ flexBasis: "100px" }} grow={false}>
        <FilterGroup
          filterButtonProps={{
            children: "Types",
          }}
          onChange={(val) => onChange("selectedTypes", val || [])}
          value={state.selectedTypes}
          options={[
            {
              label: IndicesUpdateMode.alias,
            },
            {
              label: IndicesUpdateMode.mappings,
            },
            {
              label: IndicesUpdateMode.settings,
            },
          ]}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
