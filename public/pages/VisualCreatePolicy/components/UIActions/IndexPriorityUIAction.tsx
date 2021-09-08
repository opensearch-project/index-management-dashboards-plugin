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

  isValid = (action: UIAction<IndexPriorityAction>) => {
    return action.action.index_priority.priority >= 0;
  };

  render = (action: UIAction<IndexPriorityAction>, onChangeAction: (action: UIAction<IndexPriorityAction>) => void) => {
    return (
      <>
        <EuiFormCustomLabel title="Priority" helpText="Higher priority indices are recovered first when possible." />
        <EuiFormRow isInvalid={false} error={null}>
          <EuiFieldNumber
            value={(action.action as IndexPriorityAction).index_priority.priority}
            style={{ textTransform: "capitalize" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const priority = e.target.valueAsNumber;
              onChangeAction(
                this.clone({
                  index_priority: { priority },
                })
              );
            }}
            data-test-subj="action-render-index-priority"
          />
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
