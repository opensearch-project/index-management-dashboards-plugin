/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EuiCompressedFieldSearch, EuiFlexGroup, EuiFlexItem, EuiSpacer } from "@elastic/eui";
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
    <>
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem>
          <EuiCompressedFieldSearch
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
      <EuiSpacer size="m" />
    </>
  ) : (
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
