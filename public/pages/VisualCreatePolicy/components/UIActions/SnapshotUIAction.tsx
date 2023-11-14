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
import { EuiFormRow, EuiFieldText, EuiSpacer } from "@elastic/eui";
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
        <EuiFormRow fullWidth isInvalid={!this.isValid()} error={null}>
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
        </EuiFormRow>
        <EuiSpacer size="s" />
        <EuiFormCustomLabel title="Snapshot" helpText="The name of the snapshot." isInvalid={!this.isValid()} />
        <EuiFormRow fullWidth isInvalid={!this.isValid()} error={null}>
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
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
