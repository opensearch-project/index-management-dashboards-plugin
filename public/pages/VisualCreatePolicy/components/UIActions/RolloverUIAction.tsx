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
import { EuiFormRow, EuiFieldNumber, EuiFieldText } from "@elastic/eui";
import { RolloverAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

export default class RolloverUIAction implements UIAction<RolloverAction> {
  id: string;
  action: RolloverAction;
  type = ActionType.Rollover;

  constructor(action: RolloverAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Rollover`;

  clone = (action: RolloverAction) => new RolloverUIAction(action, this.id);

  render = (action: UIAction<RolloverAction>, onChangeAction: (action: UIAction<RolloverAction>) => void) => {
    return (
      <>
        <EuiFormRow label="Minimum index age" helpText="The minimum age required to roll over the index." isInvalid={false} error={null}>
          <EuiFieldText
            value={(action.action as RolloverAction).rollover.min_index_age}
            style={{ textTransform: "capitalize" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minIndexAge = e.target.value;
              onChangeAction(
                this.clone({
                  rollover: {
                    ...action.action.rollover,
                    min_index_age: minIndexAge,
                  },
                })
              );
            }}
            data-test-subj="action-render-rollover-min-index-age"
          />
        </EuiFormRow>
        <EuiFormRow
          label="Minimum doc count"
          helpText="The minimum number of documents required to roll over the index."
          isInvalid={false}
          error={null}
        >
          <EuiFieldNumber
            value={(action.action as RolloverAction).rollover.min_doc_count}
            style={{ textTransform: "capitalize" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minDocCount = e.target.valueAsNumber;
              onChangeAction(
                this.clone({
                  rollover: {
                    ...action.action.rollover,
                    min_doc_count: minDocCount,
                  },
                })
              );
            }}
            data-test-subj="action-render-rollover-min-doc-count"
          />
        </EuiFormRow>
        <EuiFormRow
          label="Minimum index size"
          helpText="The minimum size of the total primary shard storage required to roll over the index."
          isInvalid={false}
          error={null}
        >
          <EuiFieldText
            value={(action.action as RolloverAction).rollover.min_size}
            style={{ textTransform: "capitalize" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minSize = e.target.value;
              onChangeAction(
                this.clone({
                  rollover: {
                    ...action.action.rollover,
                    min_size: minSize,
                  },
                })
              );
            }}
            data-test-subj="action-render-rollover-min-size"
          />
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
