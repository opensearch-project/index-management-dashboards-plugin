/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
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
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
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
        <EuiCodeEditor value={queryDsl} onChange={(string) => setQueryDsl(string)} mode="json" width="100%" height="250px" />
      </EuiFormRow>
    );
  }

  return (
    <div>
      <EuiPopoverTitle>
        <EuiFlexGroup alignItems="baseline" responsive={false}>
          <EuiFlexItem>Edit data filter</EuiFlexItem>
          {/*<EuiFlexItem grow={false}>*/}
          {/*  <EuiButtonEmpty size="xs" onClick={() => setIsCustomEditorOpen(!isCustomEditorOpen)}>*/}
          {/*    {isCustomEditorOpen ? "Edit filter values" : "Custom expression"}*/}
          {/*  </EuiButtonEmpty>*/}
          {/*</EuiFlexItem>*/}
        </EuiFlexGroup>
      </EuiPopoverTitle>
      <EuiForm>
        {/*TODO: implement paramsEditor and uncomment the line below*/}
        {/*{isCustomEditorOpen ? customEditor() : paramsEditor()}*/}
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
              // isDisabled={!this.isFilterValid()}
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
