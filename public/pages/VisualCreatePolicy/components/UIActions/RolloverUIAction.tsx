/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiCompressedFieldNumber, EuiCompressedFieldText, EuiSpacer } from "@elastic/eui";
import { RolloverAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

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

  isValid = () => {
    const minIndexAge = this.action.rollover.min_index_age;
    const minDocCount = this.action.rollover.min_doc_count;
    const minSize = this.action.rollover.min_size;
    const minPrimaryShardSize = this.action.rollover.min_primary_shard_size;
    if (typeof minDocCount !== "undefined") {
      if (minDocCount <= 0) return false;
    }

    // for minIndexAge and minSize and minPrimaryShardSize just let them through and backend will fail the validation
    // TODO -> add validation for index age and size.. but involves replicating checks for byte strings and time strings
    return true;
  };

  render = (action: UIAction<RolloverAction>, onChangeAction: (action: UIAction<RolloverAction>) => void) => {
    const rollover = action.action.rollover;
    return (
      <>
        <EuiFormCustomLabel
          title="Minimum index age"
          helpText={`The minimum age required to roll over the index. Accepts time units, e.g. "5h" or "1d".`}
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={rollover.min_index_age || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minIndexAge = e.target.value;
              const rollover = { ...action.action.rollover };
              if (minIndexAge) rollover.min_index_age = minIndexAge;
              else delete rollover.min_index_age;
              onChangeAction(this.clone({ rollover }));
            }}
            data-test-subj="action-render-rollover-min-index-age"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Minimum doc count"
          helpText="The minimum number of documents required to roll over the index."
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiCompressedFieldNumber
            fullWidth
            value={typeof rollover.min_doc_count === "undefined" ? "" : rollover.min_doc_count}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minDocCount = e.target.valueAsNumber;
              const rollover = { ...action.action.rollover };
              if (!isNaN(minDocCount)) rollover.min_doc_count = minDocCount;
              else delete rollover.min_doc_count;
              onChangeAction(this.clone({ rollover }));
            }}
            data-test-subj="action-render-rollover-min-doc-count"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Minimum index size"
          helpText={`The minimum size of the total primary shard storage required to roll over the index. Accepts byte units, e.g. "500mb" or "50gb".`}
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={rollover.min_size || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minSize = e.target.value;
              const rollover = { ...action.action.rollover };
              if (minSize) rollover.min_size = minSize;
              else delete rollover.min_size;
              onChangeAction(this.clone({ rollover }));
            }}
            data-test-subj="action-render-rollover-min-size"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel
          title="Minimum primary shard size"
          helpText={`The minimum size of a single primary shard required to roll over the index. Accepts byte units, e.g. "500mb" or "50gb".`}
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={false} error={null}>
          <EuiCompressedFieldText
            fullWidth
            value={rollover.min_primary_shard_size || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const minPrimaryShardSize = e.target.value;
              const rollover = { ...action.action.rollover };
              if (minPrimaryShardSize) rollover.min_primary_shard_size = minPrimaryShardSize;
              else delete rollover.min_primary_shard_size;
              onChangeAction(this.clone({ rollover }));
            }}
            data-test-subj="action-render-rollover-min-primary-shard-size"
          />
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
