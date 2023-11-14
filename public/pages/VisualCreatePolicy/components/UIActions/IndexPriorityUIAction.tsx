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

import React, { ChangeEvent } from "react";
import { EuiFormRow, EuiFieldNumber } from "@elastic/eui";
import EuiFormCustomLabel from "../EuiFormCustomLabel";
import { IndexPriorityAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class IndexPriorityUIAction implements UIAction<IndexPriorityAction> {
  id: string;
  action: IndexPriorityAction;
  type = ActionType.IndexPriority;

  constructor(action: IndexPriorityAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Set index priority to ${this.action.index_priority.priority}`;

  clone = (action: IndexPriorityAction) => new IndexPriorityUIAction(action, this.id);

  isValid = () => {
    const priority = this.action.index_priority.priority;
    return typeof priority !== "undefined" && priority >= 0;
  };

  render = (action: UIAction<IndexPriorityAction>, onChangeAction: (action: UIAction<IndexPriorityAction>) => void) => {
    const priority = action.action.index_priority.priority;
    return (
      <>
        <EuiFormCustomLabel
          title="Priority"
          helpText="Higher priority indices are recovered first when possible."
          isInvalid={!this.isValid()}
        />
        <EuiFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiFieldNumber
            fullWidth
            value={typeof priority === "undefined" ? "" : priority}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              // eslint-disable-next-line no-shadow
              const priority = e.target.valueAsNumber;
              const indexPriority = { priority };
              if (isNaN(priority)) delete indexPriority.priority;
              onChangeAction(this.clone({ index_priority: indexPriority }));
            }}
            data-test-subj="action-render-index-priority"
          />
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
