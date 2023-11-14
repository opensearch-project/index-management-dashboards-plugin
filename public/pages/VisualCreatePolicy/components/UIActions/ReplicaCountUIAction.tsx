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
import { ReplicaCountAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";
import EuiFormCustomLabel from "../EuiFormCustomLabel";

export default class ReplicaCountUIAction implements UIAction<ReplicaCountAction> {
  id: string;
  action: ReplicaCountAction;
  type = ActionType.ReplicaCount;

  constructor(action: ReplicaCountAction, id: string = makeId()) {
    this.action = action;
    this.id = id;
  }

  content = () => `Set number of replicas to ${this.action.replica_count.number_of_replicas}`;

  clone = (action: ReplicaCountAction) => new ReplicaCountUIAction(action, this.id);

  isValid = () => {
    const numberOfReplicas = this.action.replica_count.number_of_replicas;
    return typeof numberOfReplicas !== "undefined" && numberOfReplicas >= 0;
  };

  render = (action: UIAction<ReplicaCountAction>, onChangeAction: (action: UIAction<ReplicaCountAction>) => void) => {
    const replicas = action.action.replica_count.number_of_replicas;
    return (
      <>
        <EuiFormCustomLabel
          title="Number of replicas"
          helpText="The number of replicas to set for the index."
          isInvalid={!this.isValid()}
        />
        <EuiFormRow fullWidth isInvalid={!this.isValid()} error={null}>
          <EuiFieldNumber
            fullWidth
            value={typeof replicas === "undefined" ? "" : replicas}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const numberOfReplicas = e.target.valueAsNumber;
              const replicaCount = { number_of_replicas: numberOfReplicas };
              if (isNaN(numberOfReplicas)) delete replicaCount.number_of_replicas;
              onChangeAction(this.clone({ replica_count: replicaCount }));
            }}
            data-test-subj="action-render-replica-count"
          />
        </EuiFormRow>
      </>
    );
  };

  toAction = () => this.action;
}
