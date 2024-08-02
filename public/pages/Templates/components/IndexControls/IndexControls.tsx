/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EuiCompressedFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";

export interface SearchControlsProps {
  value: {
    search: string;
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
        <EuiCompressedFieldSearch
          fullWidth
          placeholder="Search..."
          value={state.search}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
