/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { EuiComboBox, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ALIAS_STATUS_OPTIONS, IndicesUpdateMode } from "../../../../utils/constants";
import { getUISettings } from "../../../../services/Services";
import AliasesActions from "../../containers/AliasActions";
import { IAlias } from "../../interface";
import { RouteComponentProps } from "react-router-dom";
import FilterGroup from "../../../../components/FilterGroup";

export interface SearchControlsProps {
  value: {
    search: string;
    status: string;
    selectedItems: IAlias[];
  };
  onSearchChange: (args: SearchControlsProps["value"]) => void;
  onDelete: () => Promise<void>;
  history: RouteComponentProps["history"];
  onUpdateAlias: () => void;
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
    <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiFieldSearch
          compressed
          fullWidth
          placeholder="Search"
          value={state.search}
          onChange={(e) => onChange("search", e.target.value)}
        />
      </EuiFlexItem>
      <EuiFlexItem style={{ flexBasis: "100px" }} grow={false}>
        <FilterGroup
          filterButtonProps={{
            children: "Status",
          }}
          onChange={(val) => onChange("status", (val || []).map((item) => item).join(","))}
          value={state.status ? state.status.split(",").map((label) => label) : []}
          options={ALIAS_STATUS_OPTIONS}
          useNewUX={useUpdatedUX}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <AliasesActions
          onUpdateAlias={props.onUpdateAlias}
          selectedItems={props.value.selectedItems}
          onDelete={props.onDelete}
          history={props.history}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  ) : (
    <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
      <EuiFlexItem>
        <EuiFieldSearch fullWidth placeholder="Search..." value={state.search} onChange={(e) => onChange("search", e.target.value)} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiComboBox
          style={{
            width: 300,
          }}
          placeholder="Status"
          options={ALIAS_STATUS_OPTIONS}
          selectedOptions={state.status ? state.status.split(",").map((label) => ({ label })) : []}
          onChange={(val) => onChange("status", (val || []).map((item) => item.label).join(","))}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
