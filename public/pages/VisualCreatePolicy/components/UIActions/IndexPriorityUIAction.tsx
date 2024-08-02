/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCompressedFieldNumber } from "@elastic/eui";
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
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiCompressedFieldNumber
            fullWidth
            value={typeof priority === "undefined" ? "" : priority}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const priority = e.target.valueAsNumber;
              const indexPriority = { priority };
              if (isNaN(priority)) delete indexPriority.priority;
              onChangeAction(this.clone({ index_priority: indexPriority }));
            }}
            data-test-subj="action-render-index-priority"
          />
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
