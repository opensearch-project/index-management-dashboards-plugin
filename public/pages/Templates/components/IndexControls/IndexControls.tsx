/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { getUISettings } from "../../../../services/Services";
import TemplatesActions from "../../containers/TemplatesActions";
import { ITemplate } from "../../interface";
import { RouteComponentProps } from "react-router-dom";

export interface SearchControlsProps {
  value: {
    search: string;
  };
  onSearchChange: (args: SearchControlsProps["value"]) => void;
  selectedItems: ITemplate[];
  getTemplates: () => Promise<void>;
  history: RouteComponentProps["history"];
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

  const uiSettings = getUISettings();
  const useUpdatedUX = uiSettings.get("home:useNewHomePage");

  return useUpdatedUX ? (
    <EuiFlexGroup style={{ padding: "0px 5px 16px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiFieldSearch
          compressed
          fullWidth
          placeholder="Search"
          value={state.search}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <TemplatesActions selectedItems={props.selectedItems} onDelete={props.getTemplates} history={props.history} />
      </EuiFlexItem>
    </EuiFlexGroup>
  ) : (
    <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiFieldSearch fullWidth placeholder="Search..." value={state.search} onChange={(e) => onChange("search", e.target.value)} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
