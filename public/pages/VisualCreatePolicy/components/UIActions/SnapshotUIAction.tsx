/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent } from "react";
import { EuiCompressedFormRow, EuiFieldText, EuiSpacer } from "@elastic/eui";
import { SnapshotAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

export default class SnapshotUIAction implements UIAction<SnapshotAction> {
  id: string;
  action: SnapshotAction;
  type = ActionType.Snapshot;

  constructor(action: SnapshotAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Snapshot`;

  clone = (action: SnapshotAction) => new SnapshotUIAction(action, this.id);

  isValid = () => {
    return !!this.action.snapshot.snapshot && !!this.action.snapshot.repository;
  };

  render = (action: UIAction<SnapshotAction>, onChangeAction: (action: UIAction<SnapshotAction>) => void) => {
    return (
      <>
        <EuiFormCustomLabel
          title="Repository"
          helpText="The repository name that you register through the native snapshot API operations."
          isInvalid={!this.isValid()}
        />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiFieldText
            fullWidth
            value={(action.action as SnapshotAction).snapshot.repository}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const repository = e.target.value;
              onChangeAction(
                this.clone({
                  snapshot: {
                    ...action.action.snapshot,
                    repository,
                  },
                })
              );
            }}
            data-test-subj="action-render-snapshot-repository"
          />
        </EuiCompressedFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel title="Snapshot" helpText="The name of the snapshot." isInvalid={!this.isValid()} />
        <EuiCompressedFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiFieldText
            fullWidth
            value={(action.action as SnapshotAction).snapshot.snapshot}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const snapshot = e.target.value;
              onChangeAction(
                this.clone({
                  snapshot: {
                    ...action.action.snapshot,
                    snapshot,
                  },
                })
              );
            }}
            data-test-subj="action-render-snapshot-snapshot"
          />
        </EuiCompressedFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
