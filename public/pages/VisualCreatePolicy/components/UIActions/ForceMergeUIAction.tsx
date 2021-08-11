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
import { ForceMergeAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class ForceMergeUIAction implements UIAction<ForceMergeAction> {
  id: string;
  action: ForceMergeAction;
  type = ActionType.ForceMerge;

  constructor(action: ForceMergeAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Force merge to ${this.action.force_merge.max_num_segments} segments`;

  clone = (action: ForceMergeAction) => new ForceMergeUIAction(action, this.id);

  render = (action: UIAction<ForceMergeAction>, onChangeAction: (action: UIAction<ForceMergeAction>) => void) => {
    return (
      <>
        <EuiFormCustomLabel title="Max num segments" helpText="The number of segments to merge to." />
        <EuiFormRow isInvalid={false} error={null}>
          <EuiFieldNumber
            value={(action.action as ForceMergeAction).force_merge.max_num_segments}
            style={{ textTransform: "capitalize" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const maxNumSegments = e.target.valueAsNumber;
              onChangeAction(
                this.clone({
                  force_merge: {
                    max_num_segments: maxNumSegments,
                  },
                })
              );
            }}
            data-test-subj="action-render-force-merge"
          />
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
