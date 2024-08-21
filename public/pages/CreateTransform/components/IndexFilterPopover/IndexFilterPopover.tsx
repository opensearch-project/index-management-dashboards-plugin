/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useState } from "react";
import {
  EuiForm,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiPopoverTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiSmallButtonEmpty,
  EuiCodeEditor,
  EuiSmallButton,
} from "@elastic/eui";
import { FieldItem, IndexItem } from "../../../../../models/interfaces";

interface IndexFilterPopoverProps {
  sourceIndex: { label: string; value?: IndexItem }[];
  fields: FieldItem[];
  sourceIndexFilter: string;
  onChangeSourceIndexFilter: (sourceIndexFilter: string) => void;
  closePopover: () => void;
}

export default function IndexFilterPopover({
  fields,
  sourceIndexFilter,
  onChangeSourceIndexFilter,
  closePopover,
}: IndexFilterPopoverProps) {
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [queryDsl, setQueryDsl] = useState(sourceIndexFilter);

  const onChangeSelectedField = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedField(e.target.value);
  };
  const onChangeSelectedOperator = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedOperator(e.target.value);
  };
  const onChangeSelectedValue = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedValue(e.target.value);
  };

  function paramsEditor() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiCompressedFormRow label="Field">
              <EuiCompressedSelect
                id="selectField"
                options={fields.map((item) => {
                  return {
                    value: item.label,
                    text: item.label,
                  };
                })}
                value={selectedField}
                onChange={onChangeSelectedField}
              />
            </EuiCompressedFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiCompressedFormRow label="Operator">
              <EuiCompressedSelect
                id="selectOperator"
                options={[]}
                // {getOperators(selectedField?.type)}
                value={selectedOperator}
                onChange={onChangeSelectedOperator}
              />
            </EuiCompressedFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexItem>
          <EuiCompressedFormRow label="Value">
            <EuiCompressedSelect id="selectValue" options={[]} value={selectedValue} onChange={onChangeSelectedValue} />
          </EuiCompressedFormRow>
        </EuiFlexItem>
      </div>
    );
  }

  function customEditor() {
    return (
      <EuiCompressedFormRow label="Custom query DSL">
        <EuiCodeEditor
          style={{ width: 0.38 * window.innerWidth, height: 0.4 * window.innerHeight }}
          value={queryDsl}
          onChange={(string) => setQueryDsl(string)}
          mode="json"
        />
      </EuiCompressedFormRow>
    );
  }

  return (
    <div style={{ width: 0.4 * window.innerWidth }}>
      <EuiPopoverTitle>
        <EuiFlexGroup alignItems="baseline" responsive={false}>
          <EuiFlexItem>Edit data filter</EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopoverTitle>
      <EuiForm>
        {/*TODO: implement paramsEditor and uncomment the line below*/}
        {/*{isCustomEditorOpen ? customEditor() : paramsEditor()}*/}
        {customEditor()}
        <EuiSpacer />
        <EuiFlexGroup direction="rowReverse" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiSmallButton
              fill
              onClick={() => {
                onChangeSourceIndexFilter(queryDsl);
                closePopover();
              }}
              data-test-subj="saveFilter"
            >
              Save
            </EuiSmallButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButtonEmpty flush="right" onClick={closePopover} data-test-subj="cancelSaveFilter">
              Cancel
            </EuiSmallButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem />
        </EuiFlexGroup>
      </EuiForm>
    </div>
  );
}
