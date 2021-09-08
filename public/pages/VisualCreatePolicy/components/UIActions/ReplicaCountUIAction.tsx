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
import { ReplicaCountAction, UIAction } from "../../../../../models/interfaces";
import { makeId } from "../../../../utils/helpers";
import { ActionType } from "../../utils/constants";

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

  isValid = (action: UIAction<ReplicaCountAction>) => {
    const numberOfReplicas = action.action.replica_count.number_of_replicas;
    return typeof numberOfReplicas !== "undefined" && numberOfReplicas >= 0;
  };

  render = (action: UIAction<ReplicaCountAction>, onChangeAction: (action: UIAction<ReplicaCountAction>) => void) => {
    const replicas = action.action.replica_count.number_of_replicas;
    return (
      <EuiFormRow label="Number of replicas" helpText="The number of replicas to set for the index." isInvalid={false} error={null}>
        <EuiFieldNumber
          value={typeof replicas === "undefined" ? "" : replicas}
          style={{ textTransform: "capitalize" }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const numberOfReplicas = e.target.valueAsNumber;
            const replicaCount = { number_of_replicas: numberOfReplicas };
            if (isNaN(numberOfReplicas)) delete replicaCount.number_of_replicas;
            onChangeAction(this.clone({ replica_count: replicaCount }));
          }}
          data-test-subj="action-render-replica-count"
        />
      </EuiFormRow>
    );
  };

  toAction = () => this.action;
}
