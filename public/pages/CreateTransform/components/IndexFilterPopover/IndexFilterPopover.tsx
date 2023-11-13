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

import React, { ChangeEvent, useState } from "react";
import {
  EuiForm,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
  EuiPopoverTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiButton,
} from "@elastic/eui";
import { FieldItem, IndexItem } from "../../../../../models/interfaces";

interface IndexFilterPopoverProps {
  sourceIndex: Array<{ label: string; value?: IndexItem }>;
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
            <EuiFormRow label="Field">
              <EuiSelect
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
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow label="Operator">
              <EuiSelect
                id="selectOperator"
                options={[]}
                // {getOperators(selectedField?.type)}
                value={selectedOperator}
                onChange={onChangeSelectedOperator}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Value">
            <EuiSelect id="selectValue" options={[]} value={selectedValue} onChange={onChangeSelectedValue} />
          </EuiFormRow>
        </EuiFlexItem>
      </div>
    );
  }

  function customEditor() {
    return (
      <EuiFormRow label="Custom query DSL">
        <EuiCodeEditor
          style={{ width: 0.38 * window.innerWidth, height: 0.4 * window.innerHeight }}
          value={queryDsl}
          onChange={(string) => setQueryDsl(string)}
          mode="json"
        />
      </EuiFormRow>
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
        {/* TODO: implement paramsEditor and uncomment the line below*/}
        {/* {isCustomEditorOpen ? customEditor() : paramsEditor()}*/}
        {customEditor()}
        <EuiSpacer />
        <EuiFlexGroup direction="rowReverse" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              onClick={() => {
                onChangeSourceIndexFilter(queryDsl);
                closePopover();
              }}
              data-test-subj="saveFilter"
            >
              Save
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty flush="right" onClick={closePopover} data-test-subj="cancelSaveFilter">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem />
        </EuiFlexGroup>
      </EuiForm>
    </div>
  );
}
