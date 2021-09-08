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
import { EuiFormRow, EuiFieldText } from "@elastic/eui";
import { SnapshotAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

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

  isValid = (action: UIAction<SnapshotAction>) => {
    return !!action.action.snapshot.snapshot && !!action.action.snapshot.repository;
  };

  render = (action: UIAction<SnapshotAction>, onChangeAction: (action: UIAction<SnapshotAction>) => void) => {
    return (
      <>
        <EuiFormRow
          label="Repository"
          helpText="The repository name that you register through the native snapshot API operations."
          isInvalid={false}
          error={null}
        >
          <EuiFieldText
            value={(action.action as SnapshotAction).snapshot.repository}
            style={{ textTransform: "capitalize" }}
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
        </EuiFormRow>
        <EuiFormRow label="Snapshot" helpText="The name of the snapshot." isInvalid={false} error={null}>
          <EuiFieldText
            value={(action.action as SnapshotAction).snapshot.snapshot}
            style={{ textTransform: "capitalize" }}
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
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
