/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EuiComboBox, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ALIAS_STATUS_OPTIONS } from "../../../../utils/constants";

export interface SearchControlsProps {
  value: {
    search: string;
    status: string;
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
      <EuiFlexItem grow={false}>
        <EuiComboBox
          style={{
            width: 150,
          }}
          singleSelection={{
            asPlainText: true,
          }}
          placeholder="Status"
          options={ALIAS_STATUS_OPTIONS}
          selectedOptions={state.status ? [{ label: state.status }] : []}
          onChange={(val) => onChange("status", val[0]?.label)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
