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

import React, { ChangeEvent, useState } from "react";
import { EuiButton, EuiFormRow, EuiComboBox, EuiFlexGroup, EuiFlexItem, EuiFieldNumber } from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import { ISMTemplate as ISMTemplateData } from "../../../../../models/interfaces";
import { ISM_TEMPLATE_INPUT_MAX_WIDTH } from "../../utils/constants";

interface ISMTemplateProps {
  template: ISMTemplateData;
  onUpdateTemplate: (template: ISMTemplateData) => void;
  onRemoveTemplate: () => void;
  isFirst: boolean;
}

const ISMTemplate = ({ template, onUpdateTemplate, onRemoveTemplate, isFirst }: ISMTemplateProps) => {
  // TODO: Move this top top of form submition
  const [isInvalid, setInvalid] = useState(false);
  return (
    <EuiFlexGroup gutterSize="l" alignItems="center">
      <EuiFlexItem style={{ maxWidth: ISM_TEMPLATE_INPUT_MAX_WIDTH }}>
        <EuiFormRow isInvalid={false} error={null}>
          <EuiComboBox
            isClearable={false}
            placeholder="Add index patterns"
            noSuggestions
            selectedOptions={template.index_patterns.map((pattern) => ({ label: pattern }))}
            onChange={(selectedOptions) => {
              onUpdateTemplate({ ...template, index_patterns: selectedOptions.map(({ label }) => label) });
              setInvalid(false);
            }}
            onCreateOption={(searchValue) => {
              if (!searchValue.trim()) {
                return false;
              }

              if (searchValue.includes(" ")) {
                setInvalid(false);
                return;
              }

              onUpdateTemplate({ ...template, index_patterns: [...template.index_patterns, searchValue] });
            }}
            onSearchChange={(searchValue) => {
              if (!searchValue) {
                setInvalid(false);

                return;
              }

              if (searchValue.includes(" ")) {
                setInvalid(true);
                return;
              }
              // TODO
              setInvalid(false);
            }}
            isInvalid={isInvalid}
            data-test-subj="ism-template-index-pattern-input"
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow error={null} isInvalid={false}>
          <EuiFieldNumber
            value={template.priority}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const priority = e.target.valueAsNumber;
              onUpdateTemplate({ ...template, priority });
            }}
            isInvalid={false}
            data-test-subj="ism-template-priority-input"
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton color="danger" onClick={onRemoveTemplate} data-test-subj="ism-template-remove-button">
          Remove
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ISMTemplate;
